import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@clerk/nextjs/server';
import { appRouter } from '@/server/routers/_app';
import { prisma, type User } from '@filmtech/database';
import type { Context } from '@/server/trpc';
import { clerkClient } from '@clerk/nextjs/server';

interface CachedUser {
    user: User & { tenant: { id: string; status: string } | null };
    timestamp: number;
}

const userCache = new Map<string, CachedUser>();
const USER_CACHE_TTL = 30 * 1000; // 30 seconds

async function createContext(): Promise<Context> {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return { db: prisma, user: null, tenantId: null };
    }

    const now = Date.now();
    const cached = userCache.get(userId);

    if (cached && (now - cached.timestamp < USER_CACHE_TTL)) {
        return {
            db: prisma,
            user: cached.user,
            tenantId: cached.user.tenantId,
        };
    }

    let user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { tenant: true },
    });

    if (user && sessionClaims) {
        const metadata = sessionClaims.public_metadata as { role?: string; tenantId?: string } | undefined;
        if (metadata?.role !== user.role || metadata?.tenantId !== user.tenantId) {
            console.log('[AuthSync] Metadata mismatch. Syncing...');
            clerkClient().then(client =>
                client.users.updateUser(userId, {
                    publicMetadata: { tenantId: user!.tenantId, role: user!.role, dbUserId: user!.id }
                })
            ).catch(() => { });
        }
    }

    if (!user) {
        try {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;

            if (email) {
                user = await prisma.user.create({
                    data: {
                        clerkId: userId,
                        email: email,
                        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || email,
                        role: 'ADMIN_SAAS',
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

                client.users.updateUser(userId, {
                    publicMetadata: { tenantId: user.tenantId, role: user.role, dbUserId: user.id }
                }).catch(() => { });
            }
        } catch (error) {
            console.error("[AuthSync] Sync failed:", error);
        }
    }

    if (user) {
        userCache.set(userId, { user: user as CachedUser['user'], timestamp: now });
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
