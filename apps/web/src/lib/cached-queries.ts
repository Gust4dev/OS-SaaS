import { unstable_cache } from 'next/cache';
import { prisma } from '@autevo/database';

export const getUserWithTenant = unstable_cache(
    async (clerkId: string) => {
        return prisma.user.findUnique({
            where: { clerkId },
            select: {
                id: true,
                role: true,
                tenantId: true,
                status: true,
                jobTitle: true,
                clerkId: true,
            }
        });
    },
    ['user-with-tenant'],
    { revalidate: 60, tags: ['user'] }
);

export const getUserByEmail = unstable_cache(
    async (email: string) => {
        return prisma.user.findFirst({
            where: { email },
            select: {
                id: true,
                role: true,
                tenantId: true,
                status: true,
                jobTitle: true,
                clerkId: true,
            }
        });
    },
    ['user-by-email'],
    { revalidate: 60, tags: ['user'] }
);

export const getUserCount = unstable_cache(
    async () => prisma.user.count(),
    ['user-count'],
    { revalidate: 300, tags: ['user'] }
);
