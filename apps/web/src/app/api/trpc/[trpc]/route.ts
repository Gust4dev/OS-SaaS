import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@clerk/nextjs/server';
import { appRouter } from '@/server/routers/_app';
import { prisma } from '@filmtech/database';
import type { Context } from '@/server/trpc';

import { clerkClient } from '@clerk/nextjs/server';

async function createContext(): Promise<Context> {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return { db: prisma, user: null, tenantId: null };
    }

    // 1. Try to find user in local DB
    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { tenant: true },
    });

    // Sync check for existing users
    if (user && sessionClaims) {
        const metadata = sessionClaims.public_metadata as any;
        if (metadata?.role !== user.role || metadata?.tenantId !== user.tenantId) {
            console.log('[AuthSync] Metadata mismatch detected. Syncing...', {
                claimRole: metadata?.role,
                dbRole: user.role
            });
            const client = await clerkClient();
            await client.users.updateUser(userId, {
                publicMetadata: {
                    tenantId: user.tenantId,
                    role: user.role,
                    dbUserId: user.id,
                }
            });
        }
    }

    // 2. If not found, SYNC from Clerk (Development/Recovery Mode)
    if (!user) {
        try {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;

            if (email) {
                console.log(`[AuthSync] Syncing user ${email} from Clerk...`);

                // Create Tenant + User
                user = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: email,
                        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || email,
                        role: 'ADMIN_SAAS', // Default for first user
                        tenant: {
                            create: {
                                name: "Minha Empresa",
                                slug: `${email.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}`,
                                status: 'ACTIVE'
                            }
                        }
                    },
                    include: { tenant: true }
                });

                // Force sync metadata immediately
                await client.users.updateUser(userId, {
                    publicMetadata: {
                        tenantId: user.tenantId,
                        role: user.role,
                        dbUserId: user.id,
                    }
                });

                console.log(`[AuthSync] User created: ${user.id} and metadata synced.`);
            }
        } catch (error) {
            console.error("[AuthSync] Failed to sync user:", error);
        }
    } else {
        // Self-healing: Check if Clerk Metadata is out of sync with DB
        // We can't easily check actual Clerk state every time, but we can assume if role is missing in session claims (if we had them)
        // For now, let's just do a "lazy" sync check by calling Clerk if we suspect issues? 
        // No, that's too slow.
        // Better strategy: If the user exists in DB, let's fire-and-forget a metadata update 
        // IF we assume this is a recovery scenario.
        // OR: We can rely on the fact that if they are in DB, they *should* have metadata.
        // Let's explicitly check `sessionClaims` if available.

        // Note: We don't have direct access to sessionClaims here unless we destructure it from auth().
        // Let's fix the destructuring first (in next edit), but for now, let's just force update if it's ADMIN_SAAS to be safe?
        // Actually, best approach is:
        const client = await clerkClient();
        // We catch this error just in case
        try {
            // We won't fetch the user every time (too slow), but we can blindly update metadata if we want strict consistency.
            // However, to avoid rate limits, maybe only if we are in this "debugging" mindset?
            // Since the USER is complaining, let's DO IT ONCE roughly.
            // Ideally we check claims.
        } catch (e) { }
    }

    // New self-healing using auth() claims would go here if we extracted it.

    return {
        db: prisma,
        user,
        tenantId: user?.tenantId ?? null,
    };
}

const handler = async (req: Request) => {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext,
        onError:
            process.env.NODE_ENV === 'development'
                ? ({ path, error }) => {
                    console.error(`tRPC error on ${path ?? '<no-path>'}:`, error.message);
                }
                : undefined,
    });
};

export { handler as GET, handler as POST };
