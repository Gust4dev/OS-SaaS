import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@autevo/database'
import { UserRole } from '@prisma/client'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    const headerPayload = await headers()
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        })
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data as any; // Cast to any to avoid strict type issues with Clerk's Discriminated Union

        const email = email_addresses?.[0]?.email_address
        const name = `${first_name ?? ''} ${last_name ?? ''}`.trim() || 'Usuário Sem Nome'

        if (!email) {
            return new Response('Error: No email found in user data', { status: 400 })
        }

        const clerk = await import('@clerk/nextjs/server').then(m => m.clerkClient())

        try {
            // Check if user already exists (by email) - e.g. was INVITED
            // Using findFirst is safer if email isn't strictly unique globally in schema (though it should be for auth)
            const existingUser = await prisma.user.findFirst({
                where: { email }
            });

            const sentTenantId = public_metadata?.tenantId as string | undefined;

            // SCENARIO 1: User exists in DB (likely INVITED)
            // We must link this new Clerk Account to the existing DB User
            if (existingUser) {
                console.log(`[Webhook] Linking Clerk ID ${id} to existing user ${existingUser.id} (Status: ${existingUser.status})`);

                const updatedUser = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        clerkId: id,
                        // Update info if provided, but keep existing if not? 
                        // Usually we want to take the latest from Clerk for profile stuff, 
                        // but role/tenant is sacred from DB.
                        avatarUrl: image_url || existingUser.avatarUrl,
                        status: 'ACTIVE', // Activate user
                    }
                });

                // IMPERATIVE: Correct the Clerk session metadata
                // The organic sign-up token DOES NOT have the tenantId/role 
                // because they weren't known at sign-up time (unless invite token was used properly).
                // Just to be safe, we ALWAYS push the DB truth back to Clerk.
                await clerk.users.updateUser(id, {
                    publicMetadata: {
                        tenantId: existingUser.tenantId,
                        role: existingUser.role,
                        dbUserId: existingUser.id,
                    }
                });

                console.log(`[Webhook] Sync complete. User ${existingUser.id} is now ACTIVE in tenant ${existingUser.tenantId}`);
                return new Response('User linked', { status: 200 });
            }

            // SCENARIO 2: Brand New User (Trial / Organic)
            // Only allowed if NO valid tenantId was sent (meaning they are not trying to hack into a tenant)
            // If they sent a tenantId but weren't in DB, that's weird (invite flow should catch above).
            // But let's assume if they have tenantId metadata, they should have been in DB.

            if (sentTenantId) {
                // Edge case: Clerk has metadata but DB doesn't have user. 
                // Maybe DB deleted? Or invite flow glitch?
                // We create them in that tenant if we trust the metadata.
                // But generally, the invite flow pre-creates the DB user.
                console.warn(`[Webhook] User ${id} has tenantId ${sentTenantId} but not found in DB. Creating as MEMBER.`);

                await prisma.user.create({
                    data: {
                        clerkId: id,
                        email,
                        name,
                        avatarUrl: image_url,
                        role: (public_metadata?.role as UserRole) || UserRole.MEMBER,
                        tenantId: sentTenantId,
                        status: 'ACTIVE',
                    }
                });
                // No need to update metadata, it's already there (presumably)
                return new Response('User created in existing tenant', { status: 200 });
            }

            // SCENARIO 3: Fresh Signup (Pending Activation - awaiting Pix payment)
            const tenantName = `Estética de ${first_name ?? 'Usuário'}`.trim()
            const baseSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
            const slug = `${baseSlug}-${Date.now().toString(36)}`

            console.log(`[Webhook] Creating new Tenant (PENDING): ${tenantName}`);

            await prisma.$transaction(async (tx) => {
                const newTenant = await tx.tenant.create({
                    data: {
                        name: tenantName,
                        slug,
                        status: 'PENDING_ACTIVATION',
                        // trialStartedAt and trialEndsAt will be set when admin activates the trial
                    }
                })

                const newUser = await tx.user.create({
                    data: {
                        clerkId: id,
                        email,
                        name,
                        avatarUrl: image_url,
                        role: UserRole.OWNER,
                        tenantId: newTenant.id,
                        status: 'ACTIVE' // Owners start active
                    }
                })

                // Back-propagate to Clerk so their session works immediately (after refresh)
                // This is crucial for the very first login
                await clerk.users.updateUser(id, {
                    publicMetadata: {
                        tenantId: newTenant.id,
                        role: 'OWNER',
                        dbUserId: newUser.id,
                    }
                });
            })

            console.log(`[Webhook] Trial Setup Complete for ${email}`);

        } catch (error) {
            console.error('[Webhook] Error creating user in database:', error)
            return new Response('Error creating user in database', { status: 500 })
        }
    }

    return new Response('', { status: 200 })
}
