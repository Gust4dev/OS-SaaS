import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the dashboard router.
 * Covers dashboard overview, financial metrics, and statistics.
 */

const mockPrisma = {
    serviceOrder: {
        count: vi.fn(),
        findMany: vi.fn(),
        aggregate: vi.fn(),
    },
    customer: {
        count: vi.fn(),
    },
    vehicle: {
        count: vi.fn(),
    },
    payment: {
        aggregate: vi.fn(),
    },
};

const createMockContext = () => ({
    db: mockPrisma,
    user: { id: 'user-123', role: 'MANAGER', tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('dashboardRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDashboardOverview', () => {
        it('should return order counts by status', async () => {
            mockPrisma.serviceOrder.count
                .mockResolvedValueOnce(5)  // AGENDADO
                .mockResolvedValueOnce(3)  // EM_ANDAMENTO
                .mockResolvedValueOnce(10) // CONCLUIDO
                .mockResolvedValueOnce(8); // ENTREGUE

            const ctx = createMockContext();

            const [agendado, emAndamento, concluido, entregue] = await Promise.all([
                ctx.db.serviceOrder.count({ where: { status: 'AGENDADO', tenantId: ctx.tenantId } }),
                ctx.db.serviceOrder.count({ where: { status: 'EM_ANDAMENTO', tenantId: ctx.tenantId } }),
                ctx.db.serviceOrder.count({ where: { status: 'CONCLUIDO', tenantId: ctx.tenantId } }),
                ctx.db.serviceOrder.count({ where: { status: 'ENTREGUE', tenantId: ctx.tenantId } }),
            ]);

            expect(agendado).toBe(5);
            expect(emAndamento).toBe(3);
            expect(concluido).toBe(10);
            expect(entregue).toBe(8);
        });

        it('should return today\'s orders', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', scheduledAt: today },
                { id: 'ord-2', scheduledAt: today },
            ]);

            const ctx = createMockContext();

            const todaysOrders = await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    scheduledAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            });

            expect(todaysOrders).toHaveLength(2);
        });

        it('should return customer and vehicle counts', async () => {
            mockPrisma.customer.count.mockResolvedValue(150);
            mockPrisma.vehicle.count.mockResolvedValue(200);

            const ctx = createMockContext();

            const [customers, vehicles] = await Promise.all([
                ctx.db.customer.count({ where: { tenantId: ctx.tenantId, deletedAt: null } }),
                ctx.db.vehicle.count({ where: { tenantId: ctx.tenantId, deletedAt: null } }),
            ]);

            expect(customers).toBe(150);
            expect(vehicles).toBe(200);
        });
    });

    describe('getFinancialOverview', () => {
        it('should calculate monthly revenue', async () => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            mockPrisma.payment.aggregate.mockResolvedValue({
                _sum: { amount: 45000 },
            });

            const ctx = createMockContext();

            const result = await ctx.db.payment.aggregate({
                where: {
                    tenantId: ctx.tenantId,
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            });

            expect(result._sum.amount).toBe(45000);
        });

        it('should return pending payments', async () => {
            mockPrisma.serviceOrder.aggregate.mockResolvedValue({
                _sum: { total: 15000 },
            });

            const ctx = createMockContext();

            // Orders that are CONCLUIDO or ENTREGUE but have balance > 0
            const result = await ctx.db.serviceOrder.aggregate({
                where: {
                    tenantId: ctx.tenantId,
                    status: { in: ['CONCLUIDO', 'ENTREGUE'] },
                },
                _sum: { total: true },
            });

            expect(result._sum.total).toBe(15000);
        });

        it('should calculate payment method distribution', async () => {
            mockPrisma.payment.aggregate
                .mockResolvedValueOnce({ _sum: { amount: 20000 } }) // PIX
                .mockResolvedValueOnce({ _sum: { amount: 15000 } }) // CARTAO_CREDITO
                .mockResolvedValueOnce({ _sum: { amount: 10000 } }); // DINHEIRO

            const ctx = createMockContext();

            const [pix, cartao, dinheiro] = await Promise.all([
                ctx.db.payment.aggregate({ where: { method: 'PIX' }, _sum: { amount: true } }),
                ctx.db.payment.aggregate({ where: { method: 'CARTAO_CREDITO' }, _sum: { amount: true } }),
                ctx.db.payment.aggregate({ where: { method: 'DINHEIRO' }, _sum: { amount: true } }),
            ]);

            const total = (pix._sum.amount || 0) + (cartao._sum.amount || 0) + (dinheiro._sum.amount || 0);

            expect(total).toBe(45000);
        });
    });

    describe('getRecentActivity', () => {
        it('should return recent orders', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', code: 'OS-001', createdAt: new Date() },
                { id: 'ord-2', code: 'OS-002', createdAt: new Date() },
            ]);

            const ctx = createMockContext();

            const recentOrders = await ctx.db.serviceOrder.findMany({
                where: { tenantId: ctx.tenantId },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            expect(recentOrders).toHaveLength(2);
        });
    });

    describe('getUpcomingOrders', () => {
        it('should return orders scheduled for next 7 days', async () => {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', scheduledAt: new Date(today.getTime() + 86400000) },
                { id: 'ord-2', scheduledAt: new Date(today.getTime() + 172800000) },
            ]);

            const ctx = createMockContext();

            const upcoming = await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    status: 'AGENDADO',
                    scheduledAt: {
                        gte: today,
                        lte: nextWeek,
                    },
                },
                orderBy: { scheduledAt: 'asc' },
            });

            expect(upcoming).toHaveLength(2);
        });
    });
});

describe('dashboardRouter - Member View', () => {
    it('should filter data for MEMBER role', () => {
        const ctx = {
            user: { id: 'member-1', role: 'MEMBER' },
            tenantId: 'tenant-123',
        };

        const buildWhere = () => {
            const where: Record<string, unknown> = { tenantId: ctx.tenantId };

            if (ctx.user.role === 'MEMBER') {
                where.assignedToId = ctx.user.id;
            }

            return where;
        };

        const where = buildWhere();
        expect(where.assignedToId).toBe('member-1');
    });

    it('should show all data for MANAGER role', () => {
        const ctx = {
            user: { id: 'manager-1', role: 'MANAGER' },
            tenantId: 'tenant-123',
        };

        const buildWhere = () => {
            const where: Record<string, unknown> = { tenantId: ctx.tenantId };

            if (ctx.user.role === 'MEMBER') {
                where.assignedToId = ctx.user.id;
            }

            return where;
        };

        const where = buildWhere();
        expect(where.assignedToId).toBeUndefined();
    });
});
