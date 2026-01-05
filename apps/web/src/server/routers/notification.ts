import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const notificationRouter = router({
    list: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(20).default(5),
            })
        )
        .query(async ({ ctx, input }) => {
            const items = await ctx.db.notificationLog.findMany({
                where: {
                    tenantId: ctx.user?.tenantId!,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: input.limit,
            });

            const unreadCount = await ctx.db.notificationLog.count({
                where: {
                    tenantId: ctx.user?.tenantId!,
                    status: 'pending',
                },
            });

            return {
                items,
                unreadCount,
            };
        }),

    markAsRead: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.notificationLog.update({
                where: {
                    id: input.id,
                    tenantId: ctx.user?.tenantId!,
                },
                data: {
                    status: 'read',
                },
            });
        }),
});

