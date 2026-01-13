import { router, managerProcedure } from '../trpc';

export const backupRouter = router({
    // Full tenant data export (LGPD)
    exportAllData: managerProcedure.query(async ({ ctx }) => {
        const tenantId = ctx.tenantId!;

        // Fetch everything in parallel
        const [
            customers,
            vehicles,
            orders,
            payments,
            services,
            products,
            team
        ] = await Promise.all([
            ctx.db.customer.findMany({ where: { tenantId, deletedAt: null } }),
            ctx.db.vehicle.findMany({ where: { tenantId, deletedAt: null } }),
            ctx.db.serviceOrder.findMany({
                where: { tenantId },
                include: { items: true, products: true }
            }),
            ctx.db.payment.findMany({
                where: { order: { tenantId } }
            }),
            ctx.db.service.findMany({ where: { tenantId } }),
            ctx.db.product.findMany({ where: { tenantId } }),
            ctx.db.user.findMany({ where: { tenantId } }),
        ]);

        return {
            customers,
            vehicles,
            orders,
            payments,
            services,
            products,
            team: team.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
            exportedAt: new Date(),
        };
    }),
});
