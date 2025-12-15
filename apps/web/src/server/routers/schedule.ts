import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';

export const scheduleRouter = router({
    /**
     * Busca todas as ordens de serviço dentro de um mês específico.
     * Retorna dados mínimos para exibição no calendário.
     */
    getByMonth: protectedProcedure
        .input(
            z.object({
                month: z.number().min(0).max(11), // 0-indexed (Jan=0)
                year: z.number().min(2020).max(2100),
            })
        )
        .query(async ({ ctx, input }) => {
            const startOfMonth = new Date(input.year, input.month, 1);
            const endOfMonth = new Date(input.year, input.month + 1, 0, 23, 59, 59, 999);

            const orders = await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId!,
                    scheduledAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                select: {
                    id: true,
                    code: true,
                    status: true,
                    scheduledAt: true,
                    vehicle: {
                        select: {
                            model: true,
                            plate: true,
                        },
                    },
                    items: {
                        select: {
                            service: {
                                select: { name: true },
                            },
                            customName: true,
                        },
                        take: 1, // Apenas o primeiro serviço para preview
                    },
                },
                orderBy: {
                    scheduledAt: 'asc',
                },
            });

            return orders.map((order) => ({
                id: order.id,
                code: order.code,
                status: order.status,
                scheduledAt: order.scheduledAt,
                carModel: order.vehicle.model,
                plate: order.vehicle.plate,
                service: order.items[0]?.service?.name || order.items[0]?.customName || 'Serviço',
            }));
        }),
});
