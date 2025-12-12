import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@clerk/nextjs/server';
import { appRouter } from '@/server/routers/_app';
import { prisma } from '@filmtech/database';
import type { Context } from '@/server/trpc';

import { clerkClient } from '@clerk/nextjs/server';

async function createContext(): Promise<Context> {
    const { userId } = await auth();

    if (!userId) {
        return { db: prisma, user: null, tenantId: null };
    }

    // 1. Try to find user in local DB
    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { tenant: true },
    });

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
                                slug: email.split('@')[0].replace(/[^a-z0-9]/gi, '-').toLowerCase(),
                                status: 'ACTIVE'
                            }
                        }
                    },
                    include: { tenant: true }
                });
                console.log(`[AuthSync] User created: ${user.id}`);
            }
        } catch (error) {
            console.error("[AuthSync] Failed to sync user:", error);
        }
    }

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
