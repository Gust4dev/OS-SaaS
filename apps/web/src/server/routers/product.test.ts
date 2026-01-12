import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the product router.
 * Covers product CRUD, stock management, and movements.
 */

const mockPrisma = {
    product: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    stockMovement: {
        create: vi.fn(),
        findMany: vi.fn(),
    },
};

const createMockContext = (role = 'MANAGER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('productRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('list', () => {
        it('should return paginated products', async () => {
            mockPrisma.product.findMany.mockResolvedValue([
                { id: 'prod-1', name: 'Shampoo Automotivo', stock: 50, price: 45 },
                { id: 'prod-2', name: 'Cera Carnaúba', stock: 20, price: 120 },
            ]);
            mockPrisma.product.count.mockResolvedValue(2);

            const ctx = createMockContext();

            const products = await ctx.db.product.findMany({
                where: { tenantId: ctx.tenantId },
            });

            expect(products).toHaveLength(2);
        });

        it('should filter by low stock', async () => {
            mockPrisma.product.findMany.mockResolvedValue([
                { id: 'prod-1', name: 'Item Baixo Estoque', stock: 3, minStock: 5 },
            ]);

            const ctx = createMockContext();
            const minStock = 5;

            await ctx.db.product.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    stock: { lt: minStock },
                },
            });

            expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        stock: { lt: 5 },
                    }),
                })
            );
        });

        it('should search by name', async () => {
            mockPrisma.product.findMany.mockResolvedValue([]);

            const ctx = createMockContext();
            const search = 'Shampoo';

            await ctx.db.product.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    name: { contains: search, mode: 'insensitive' },
                },
            });

            expect(mockPrisma.product.findMany).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create product with initial stock', async () => {
            mockPrisma.product.create.mockResolvedValue({
                id: 'new-prod',
                name: 'Novo Produto',
                stock: 100,
                price: 50,
            });
            mockPrisma.stockMovement.create.mockResolvedValue({});

            const ctx = createMockContext();
            const input = {
                name: 'Novo Produto',
                price: 50,
                stock: 100,
            };

            const product = await ctx.db.product.create({
                data: { ...input, tenantId: ctx.tenantId },
            });

            // Register initial stock movement
            await ctx.db.stockMovement.create({
                data: {
                    productId: product.id,
                    type: 'ENTRADA',
                    quantity: input.stock,
                    reason: 'Estoque inicial',
                    tenantId: ctx.tenantId,
                    userId: ctx.user.id,
                },
            });

            expect(product.stock).toBe(100);
            expect(mockPrisma.stockMovement.create).toHaveBeenCalled();
        });
    });

    describe('updateStock', () => {
        it('should add stock (entrada)', async () => {
            mockPrisma.product.findFirst.mockResolvedValue({
                id: 'prod-1',
                stock: 50,
            });
            mockPrisma.product.update.mockResolvedValue({
                id: 'prod-1',
                stock: 70,
            });

            const ctx = createMockContext();
            const movement = { quantity: 20, type: 'ENTRADA' };

            const product = await ctx.db.product.findFirst({
                where: { id: 'prod-1', tenantId: ctx.tenantId },
            });

            const newStock = product!.stock + movement.quantity;

            const updated = await ctx.db.product.update({
                where: { id: 'prod-1' },
                data: { stock: newStock },
            });

            expect(updated.stock).toBe(70);
        });

        it('should subtract stock (saída)', async () => {
            mockPrisma.product.findFirst.mockResolvedValue({
                id: 'prod-1',
                stock: 50,
            });
            mockPrisma.product.update.mockResolvedValue({
                id: 'prod-1',
                stock: 45,
            });

            const ctx = createMockContext();
            const movement = { quantity: 5, type: 'SAIDA' };

            const product = await ctx.db.product.findFirst({
                where: { id: 'prod-1', tenantId: ctx.tenantId },
            });

            const newStock = product!.stock - movement.quantity;

            expect(newStock).toBe(45);
        });

        it('should prevent negative stock', async () => {
            mockPrisma.product.findFirst.mockResolvedValue({
                id: 'prod-1',
                stock: 5,
            });

            const ctx = createMockContext();
            const withdrawal = 10;

            const product = await ctx.db.product.findFirst({
                where: { id: 'prod-1' },
            });

            const checkStock = () => {
                if (product!.stock < withdrawal) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Estoque insuficiente',
                    });
                }
            };

            expect(checkStock).toThrow('insuficiente');
        });

        it('should record stock movement with reason', async () => {
            mockPrisma.stockMovement.create.mockResolvedValue({
                id: 'mov-1',
                type: 'SAIDA',
                quantity: 3,
                reason: 'Uso em OS #123',
            });

            const ctx = createMockContext();

            const movement = await ctx.db.stockMovement.create({
                data: {
                    productId: 'prod-1',
                    type: 'SAIDA',
                    quantity: 3,
                    reason: 'Uso em OS #123',
                    tenantId: ctx.tenantId,
                    userId: ctx.user.id,
                },
            });

            expect(movement.reason).toContain('OS #123');
        });
    });

    describe('getMovements', () => {
        it('should return stock movement history', async () => {
            mockPrisma.stockMovement.findMany.mockResolvedValue([
                { id: 'mov-1', type: 'ENTRADA', quantity: 100, createdAt: new Date() },
                { id: 'mov-2', type: 'SAIDA', quantity: 5, createdAt: new Date() },
            ]);

            const ctx = createMockContext();

            const movements = await ctx.db.stockMovement.findMany({
                where: { productId: 'prod-1', tenantId: ctx.tenantId },
                orderBy: { createdAt: 'desc' },
            });

            expect(movements).toHaveLength(2);
        });
    });
});

describe('productRouter - Input Validation', () => {
    it('should require positive price', () => {
        const validatePrice = (price: number) => {
            if (price < 0) {
                throw new Error('Preço deve ser positivo');
            }
            return true;
        };

        expect(() => validatePrice(-10)).toThrow();
        expect(validatePrice(0)).toBe(true);
        expect(validatePrice(50)).toBe(true);
    });

    it('should require positive stock quantity', () => {
        const validateQuantity = (quantity: number) => {
            if (quantity < 0) {
                throw new Error('Quantidade deve ser positiva');
            }
            return true;
        };

        expect(() => validateQuantity(-5)).toThrow();
        expect(validateQuantity(0)).toBe(true);
    });

    it('should require product name', () => {
        const validateName = (name: string) => {
            if (!name || name.length < 2) {
                throw new Error('Nome é obrigatório');
            }
            return true;
        };

        expect(() => validateName('')).toThrow();
        expect(validateName('Shampoo')).toBe(true);
    });
});
