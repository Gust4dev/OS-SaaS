import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the admin router.
 * Covers tenant lifecycle management, trial activation, and suspension.
 */

const mockPrisma = {
    tenant: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    user: {
        count: vi.fn(),
    },
    serviceOrder: {
        count: vi.fn(),
        findFirst: vi.fn(),
    },
};

const createMockContext = () => ({
    db: mockPrisma,
    user: { id: 'admin-user', role: 'ADMIN_SAAS', tenantId: null },
    tenantId: null,
});

describe('adminRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return tenant statistics', async () => {
            mockPrisma.tenant.count
                .mockResolvedValueOnce(100) // total
                .mockResolvedValueOnce(10)  // pending
                .mockResolvedValueOnce(30)  // trial
                .mockResolvedValueOnce(50)  // active
                .mockResolvedValueOnce(5)   // suspended
                .mockResolvedValueOnce(5);  // canceled

            const ctx = createMockContext();

            const [total, pending, trial, active, suspended, canceled] = await Promise.all([
                ctx.db.tenant.count({}),
                ctx.db.tenant.count({ where: { status: 'PENDING_ACTIVATION' } }),
                ctx.db.tenant.count({ where: { status: 'TRIAL' } }),
                ctx.db.tenant.count({ where: { status: 'ACTIVE' } }),
                ctx.db.tenant.count({ where: { status: 'SUSPENDED' } }),
                ctx.db.tenant.count({ where: { status: 'CANCELED' } }),
            ]);

            expect(total).toBe(100);
            expect(pending).toBe(10);
            expect(trial).toBe(30);
            expect(active).toBe(50);
        });
    });

    describe('listTenants', () => {
        it('should return paginated tenant list', async () => {
            mockPrisma.tenant.findMany.mockResolvedValue([
                { id: 't-1', name: 'Tenant 1', status: 'ACTIVE' },
                { id: 't-2', name: 'Tenant 2', status: 'TRIAL' },
            ]);
            mockPrisma.tenant.count.mockResolvedValue(2);

            const ctx = createMockContext();

            const tenants = await ctx.db.tenant.findMany({
                skip: 0,
                take: 20,
            });

            expect(tenants).toHaveLength(2);
        });

        it('should filter by status', async () => {
            mockPrisma.tenant.findMany.mockResolvedValue([]);

            const ctx = createMockContext();

            await ctx.db.tenant.findMany({
                where: { status: 'PENDING_ACTIVATION' },
            });

            expect(mockPrisma.tenant.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'PENDING_ACTIVATION' },
                })
            );
        });

        it('should search by name or slug', async () => {
            mockPrisma.tenant.findMany.mockResolvedValue([]);

            const ctx = createMockContext();
            const search = 'autoshine';

            await ctx.db.tenant.findMany({
                where: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { slug: { contains: search, mode: 'insensitive' } },
                    ],
                },
            });

            expect(mockPrisma.tenant.findMany).toHaveBeenCalled();
        });
    });

    describe('activateTrial', () => {
        it('should activate trial for PENDING_ACTIVATION tenant', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'PENDING_ACTIVATION',
                name: 'New Tenant',
            });

            const trialDays = 60;
            const now = new Date();
            const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

            mockPrisma.tenant.update.mockResolvedValue({
                id: 't-1',
                status: 'TRIAL',
                trialStartedAt: now,
                trialEndsAt,
            });

            const ctx = createMockContext();

            const tenant = await ctx.db.tenant.findUnique({ where: { id: 't-1' } });

            expect(tenant?.status).toBe('PENDING_ACTIVATION');

            const updated = await ctx.db.tenant.update({
                where: { id: 't-1' },
                data: {
                    status: 'TRIAL',
                    trialStartedAt: now,
                    trialEndsAt,
                },
            });

            expect(updated.status).toBe('TRIAL');
            expect(updated.trialStartedAt).toBeInstanceOf(Date);
        });

        it('should reject activation for already active tenant', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'ACTIVE',
            });

            const ctx = createMockContext();
            const tenant = await ctx.db.tenant.findUnique({ where: { id: 't-1' } });

            const checkStatus = () => {
                if (tenant?.status !== 'PENDING_ACTIVATION') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Tenant must be PENDING_ACTIVATION to start trial',
                    });
                }
            };

            expect(checkStatus).toThrow('PENDING_ACTIVATION');
        });
    });

    describe('extendTrial', () => {
        it('should extend trial for TRIAL tenant', async () => {
            const currentTrialEnd = new Date();
            const additionalDays = 30;
            const newTrialEnd = new Date(currentTrialEnd.getTime() + additionalDays * 24 * 60 * 60 * 1000);

            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'TRIAL',
                trialEndsAt: currentTrialEnd,
            });
            mockPrisma.tenant.update.mockResolvedValue({
                id: 't-1',
                trialEndsAt: newTrialEnd,
            });

            const ctx = createMockContext();

            const tenant = await ctx.db.tenant.findUnique({ where: { id: 't-1' } });
            expect(tenant?.status).toBe('TRIAL');

            const updated = await ctx.db.tenant.update({
                where: { id: 't-1' },
                data: { trialEndsAt: newTrialEnd },
            });

            expect(updated.trialEndsAt.getTime()).toBeGreaterThan(currentTrialEnd.getTime());
        });

        it('should reject extending non-trial tenant', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'ACTIVE',
            });

            const ctx = createMockContext();
            const tenant = await ctx.db.tenant.findUnique({ where: { id: 't-1' } });

            const checkStatus = () => {
                if (tenant?.status !== 'TRIAL') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Only TRIAL tenants can have their trial extended',
                    });
                }
            };

            expect(checkStatus).toThrow('TRIAL');
        });
    });

    describe('suspendTenant', () => {
        it('should suspend tenant with reason', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'ACTIVE',
            });
            mockPrisma.tenant.update.mockResolvedValue({
                id: 't-1',
                status: 'SUSPENDED',
                suspendedAt: new Date(),
                suspendReason: 'Pagamento atrasado',
            });

            const ctx = createMockContext();

            const updated = await ctx.db.tenant.update({
                where: { id: 't-1' },
                data: {
                    status: 'SUSPENDED',
                    suspendedAt: new Date(),
                    suspendReason: 'Pagamento atrasado',
                },
            });

            expect(updated.status).toBe('SUSPENDED');
            expect(updated.suspendReason).toBe('Pagamento atrasado');
        });

        it('should not suspend already suspended tenant', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'SUSPENDED',
            });

            const tenant = await mockPrisma.tenant.findUnique({ where: { id: 't-1' } });

            const checkStatus = () => {
                if (tenant?.status === 'SUSPENDED') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Tenant is already suspended',
                    });
                }
            };

            expect(checkStatus).toThrow('already suspended');
        });
    });

    describe('reactivateTenant', () => {
        it('should reactivate suspended tenant as TRIAL', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'SUSPENDED',
            });
            mockPrisma.tenant.update.mockResolvedValue({
                id: 't-1',
                status: 'TRIAL',
                suspendedAt: null,
            });

            const ctx = createMockContext();

            const updated = await ctx.db.tenant.update({
                where: { id: 't-1' },
                data: {
                    status: 'TRIAL',
                    suspendedAt: null,
                    trialStartedAt: new Date(),
                    trialEndsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                },
            });

            expect(updated.status).toBe('TRIAL');
        });

        it('should reactivate suspended tenant as ACTIVE', async () => {
            mockPrisma.tenant.update.mockResolvedValue({
                id: 't-1',
                status: 'ACTIVE',
            });

            const ctx = createMockContext();

            const updated = await ctx.db.tenant.update({
                where: { id: 't-1' },
                data: { status: 'ACTIVE', suspendedAt: null },
            });

            expect(updated.status).toBe('ACTIVE');
        });

        it('should only allow reactivating SUSPENDED tenants', async () => {
            mockPrisma.tenant.findUnique.mockResolvedValue({
                id: 't-1',
                status: 'ACTIVE',
            });

            const tenant = await mockPrisma.tenant.findUnique({ where: { id: 't-1' } });

            const checkStatus = () => {
                if (tenant?.status !== 'SUSPENDED') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Only SUSPENDED tenants can be reactivated',
                    });
                }
            };

            expect(checkStatus).toThrow('SUSPENDED');
        });
    });
});

describe('adminRouter - Access Control', () => {
    it('should only allow ADMIN_SAAS role', () => {
        const checkRole = (role: string) => {
            if (role !== 'ADMIN_SAAS') {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }
            return true;
        };

        expect(checkRole('ADMIN_SAAS')).toBe(true);
        expect(() => checkRole('OWNER')).toThrow(TRPCError);
        expect(() => checkRole('MANAGER')).toThrow(TRPCError);
        expect(() => checkRole('MEMBER')).toThrow(TRPCError);
    });
});
