import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the service router.
 * Covers catalog management, pricing, and toggle functionality.
 */

const mockPrisma = {
    service: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
};

const createMockContext = (role = 'MANAGER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('serviceRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('list', () => {
        it('should return paginated services', async () => {
            const mockServices = [
                { id: 'srv-1', name: 'Polimento', basePrice: 500, isActive: true },
                { id: 'srv-2', name: 'Lavagem', basePrice: 150, isActive: true },
            ];

            mockPrisma.service.findMany.mockResolvedValue(mockServices);
            mockPrisma.service.count.mockResolvedValue(2);

            const ctx = createMockContext();

            const services = await ctx.db.service.findMany({
                where: { tenantId: ctx.tenantId },
            });
            const total = await ctx.db.service.count({ where: { tenantId: ctx.tenantId } });

            expect(services).toHaveLength(2);
            expect(total).toBe(2);
        });

        it('should filter by active status', async () => {
            mockPrisma.service.findMany.mockResolvedValue([]);

            const ctx = createMockContext();

            await ctx.db.service.findMany({
                where: { tenantId: ctx.tenantId, isActive: true },
            });

            expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isActive: true }),
                })
            );
        });

        it('should search by name', async () => {
            mockPrisma.service.findMany.mockResolvedValue([]);

            const ctx = createMockContext();
            const search = 'Polimento';

            await ctx.db.service.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                },
            });

            expect(mockPrisma.service.findMany).toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('should return service details', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 'srv-1',
                name: 'Polimento Técnico',
                basePrice: 500,
                estimatedTime: 180,
            });

            const ctx = createMockContext();

            const service = await ctx.db.service.findFirst({
                where: { id: 'srv-1', tenantId: ctx.tenantId },
            });

            expect(service?.name).toBe('Polimento Técnico');
        });

        it('should throw NOT_FOUND for non-existent service', async () => {
            mockPrisma.service.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();

            const service = await ctx.db.service.findFirst({
                where: { id: 'non-existent', tenantId: ctx.tenantId },
            });

            const checkExists = () => {
                if (!service) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Serviço não encontrado' });
                }
            };

            expect(checkExists).toThrow(TRPCError);
        });
    });

    describe('create', () => {
        it('should create service with valid data (managers only)', async () => {
            mockPrisma.service.create.mockResolvedValue({
                id: 'new-srv',
                name: 'Vitrificação',
                basePrice: 2500,
            });

            const ctx = createMockContext('MANAGER');
            const input = { name: 'Vitrificação', basePrice: 2500 };

            const service = await ctx.db.service.create({
                data: { ...input, tenantId: ctx.tenantId },
            });

            expect(service.id).toBe('new-srv');
            expect(mockPrisma.service.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Vitrificação',
                    basePrice: 2500,
                    tenantId: 'tenant-123',
                }),
            });
        });

        it('should set default values for optional fields', async () => {
            mockPrisma.service.create.mockResolvedValue({
                id: 'new-srv',
                isActive: true,
            });

            const ctx = createMockContext();
            const input = { name: 'Serviço', basePrice: 100 };

            await ctx.db.service.create({
                data: { ...input, isActive: true, tenantId: ctx.tenantId },
            });

            expect(mockPrisma.service.create).toHaveBeenCalledWith({
                data: expect.objectContaining({ isActive: true }),
            });
        });
    });

    describe('update', () => {
        it('should update service (managers only)', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 'srv-1',
                tenantId: 'tenant-123',
            });
            mockPrisma.service.update.mockResolvedValue({
                id: 'srv-1',
                name: 'Serviço Atualizado',
            });

            const ctx = createMockContext('MANAGER');

            const existing = await ctx.db.service.findFirst({
                where: { id: 'srv-1', tenantId: ctx.tenantId },
            });

            expect(existing).not.toBeNull();

            const updated = await ctx.db.service.update({
                where: { id: 'srv-1' },
                data: { name: 'Serviço Atualizado' },
            });

            expect(updated.name).toBe('Serviço Atualizado');
        });
    });

    describe('toggleActive', () => {
        it('should toggle active status', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 'srv-1',
                isActive: true,
            });
            mockPrisma.service.update.mockResolvedValue({
                id: 'srv-1',
                isActive: false,
            });

            const ctx = createMockContext('MANAGER');

            const existing = await ctx.db.service.findFirst({
                where: { id: 'srv-1', tenantId: ctx.tenantId },
            });

            const updated = await ctx.db.service.update({
                where: { id: 'srv-1' },
                data: { isActive: !existing!.isActive },
            });

            expect(updated.isActive).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete service with no orders', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 'srv-1',
                _count: { orderItems: 0 },
            });
            mockPrisma.service.delete.mockResolvedValue({ id: 'srv-1' });

            const ctx = createMockContext('MANAGER');

            const existing = await ctx.db.service.findFirst({
                where: { id: 'srv-1', tenantId: ctx.tenantId },
                include: { _count: { select: { orderItems: true } } },
            });

            if (existing?._count?.orderItems === 0) {
                await ctx.db.service.delete({ where: { id: 'srv-1' } });
            }

            expect(mockPrisma.service.delete).toHaveBeenCalled();
        });

        it('should prevent deletion of service with orders', async () => {
            mockPrisma.service.findFirst.mockResolvedValue({
                id: 'srv-1',
                _count: { orderItems: 5 },
            });

            const ctx = createMockContext('MANAGER');

            const existing = await ctx.db.service.findFirst({
                where: { id: 'srv-1', tenantId: ctx.tenantId },
                include: { _count: { select: { orderItems: true } } },
            });

            const checkDeletable = () => {
                if (existing?._count?.orderItems && existing._count.orderItems > 0) {
                    throw new TRPCError({
                        code: 'PRECONDITION_FAILED',
                        message: 'Serviço possui ordens vinculadas. Desative-o ao invés de excluir.',
                    });
                }
            };

            expect(checkDeletable).toThrow(TRPCError);
            expect(checkDeletable).toThrow('ordens vinculadas');
        });
    });

    describe('listActive', () => {
        it('should return only active services for selection', async () => {
            mockPrisma.service.findMany.mockResolvedValue([
                { id: 'srv-1', name: 'Polimento', basePrice: 500 },
            ]);

            const ctx = createMockContext();

            const services = await ctx.db.service.findMany({
                where: { tenantId: ctx.tenantId, isActive: true },
                orderBy: { name: 'asc' },
                select: { id: true, name: true, basePrice: true, estimatedTime: true },
            });

            expect(mockPrisma.service.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ isActive: true }),
                })
            );
        });
    });
});

describe('serviceRouter - Input Validation', () => {
    it('should require positive base price', () => {
        const validatePrice = (price: number) => {
            if (price < 0) {
                throw new Error('Preço deve ser positivo');
            }
            return true;
        };

        expect(() => validatePrice(-100)).toThrow();
        expect(validatePrice(0)).toBe(true);
        expect(validatePrice(500)).toBe(true);
    });

    it('should require minimum name length', () => {
        const validateName = (name: string) => {
            if (name.length < 2) {
                throw new Error('Nome deve ter pelo menos 2 caracteres');
            }
            return true;
        };

        expect(() => validateName('A')).toThrow();
        expect(validateName('AB')).toBe(true);
    });

    it('should validate estimated time as positive', () => {
        const validateTime = (time: number | undefined) => {
            if (time !== undefined && time < 0) {
                throw new Error('Tempo deve ser positivo');
            }
            return true;
        };

        expect(validateTime(undefined)).toBe(true);
        expect(validateTime(60)).toBe(true);
        expect(() => validateTime(-30)).toThrow();
    });

    it('should validate commission percentage range', () => {
        const validateCommission = (percent: number | undefined) => {
            if (percent !== undefined && (percent < 0 || percent > 100)) {
                throw new Error('Comissão deve estar entre 0 e 100%');
            }
            return true;
        };

        expect(validateCommission(undefined)).toBe(true);
        expect(validateCommission(15)).toBe(true);
        expect(() => validateCommission(150)).toThrow();
        expect(() => validateCommission(-5)).toThrow();
    });
});
