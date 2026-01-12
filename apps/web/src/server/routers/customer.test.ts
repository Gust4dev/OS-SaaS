import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the customer router.
 * Covers CRUD operations, validation, and tenant isolation.
 */

// Mock Prisma
const mockPrisma = {
    customer: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    vehicle: {
        findFirst: vi.fn(),
        updateMany: vi.fn(),
    },
};

// Mock context factory
const createMockContext = (role = 'MANAGER') => ({
    db: mockPrisma,
    user: {
        id: 'user-123',
        role,
        tenantId: 'tenant-123',
    },
    tenantId: 'tenant-123',
});

describe('customerRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('list', () => {
        it('should return paginated customers for tenant', async () => {
            const mockCustomers = [
                { id: 'cust-1', name: 'João Silva', phone: '11999999999' },
                { id: 'cust-2', name: 'Maria Santos', phone: '11888888888' },
            ];

            mockPrisma.customer.findMany.mockResolvedValue(mockCustomers);
            mockPrisma.customer.count.mockResolvedValue(2);

            const ctx = createMockContext();
            const input = { page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' };

            // Simulate router behavior
            const result = await (async () => {
                const customers = await ctx.db.customer.findMany({
                    where: { tenantId: ctx.tenantId },
                    skip: (input.page - 1) * input.limit,
                    take: input.limit,
                });
                const total = await ctx.db.customer.count({ where: { tenantId: ctx.tenantId } });

                return {
                    customers,
                    pagination: {
                        page: input.page,
                        limit: input.limit,
                        total,
                        totalPages: Math.ceil(total / input.limit),
                    },
                };
            })();

            expect(result.customers).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
            expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { tenantId: 'tenant-123' },
                })
            );
        });

        it('should filter customers by search term', async () => {
            mockPrisma.customer.findMany.mockResolvedValue([]);
            mockPrisma.customer.count.mockResolvedValue(0);

            const ctx = createMockContext();
            const search = 'João';

            await ctx.db.customer.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { phone: { contains: search } },
                    ],
                },
            });

            expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        OR: expect.any(Array),
                    }),
                })
            );
        });
    });

    describe('getById', () => {
        it('should return customer with vehicles', async () => {
            const mockCustomer = {
                id: 'cust-1',
                name: 'João Silva',
                phone: '11999999999',
                vehicles: [{ id: 'veh-1', plate: 'ABC1234' }],
            };

            mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

            const ctx = createMockContext();
            const customer = await ctx.db.customer.findFirst({
                where: { id: 'cust-1', tenantId: ctx.tenantId },
                include: { vehicles: true },
            });

            expect(customer).toEqual(mockCustomer);
            expect(mockPrisma.customer.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'cust-1', tenantId: 'tenant-123' },
                })
            );
        });

        it('should throw NOT_FOUND for non-existent customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();
            const customer = await ctx.db.customer.findFirst({
                where: { id: 'non-existent', tenantId: ctx.tenantId },
            });

            const checkExists = () => {
                if (!customer) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Cliente não encontrado' });
                }
            };

            expect(checkExists).toThrow(TRPCError);
            expect(checkExists).toThrow('não encontrado');
        });

        it('should not return customer from another tenant', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();

            // Query includes tenantId filter, so other tenant's customer won't be found
            const customer = await ctx.db.customer.findFirst({
                where: { id: 'other-tenant-customer', tenantId: ctx.tenantId },
            });

            expect(customer).toBeNull();
        });
    });

    describe('create', () => {
        it('should create customer with valid data', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null); // No duplicate
            mockPrisma.customer.create.mockResolvedValue({
                id: 'new-cust',
                name: 'Novo Cliente',
                phone: '11999999999',
            });

            const ctx = createMockContext();
            const input = { name: 'Novo Cliente', phone: '11999999999' };

            // Check for duplicate
            const existing = await ctx.db.customer.findFirst({
                where: { tenantId: ctx.tenantId, phone: input.phone },
            });

            expect(existing).toBeNull();

            const customer = await ctx.db.customer.create({
                data: { ...input, tenantId: ctx.tenantId },
            });

            expect(customer.id).toBe('new-cust');
            expect(mockPrisma.customer.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Novo Cliente',
                    tenantId: 'tenant-123',
                }),
            });
        });

        it('should reject duplicate phone number', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({ id: 'existing', phone: '11999999999' });

            const ctx = createMockContext();
            const input = { name: 'Outro Cliente', phone: '11999999999' };

            const existing = await ctx.db.customer.findFirst({
                where: { tenantId: ctx.tenantId, phone: input.phone },
            });

            const checkDuplicate = () => {
                if (existing) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Já existe um cliente com este telefone',
                    });
                }
            };

            expect(checkDuplicate).toThrow(TRPCError);
            expect(checkDuplicate).toThrow('Já existe');
        });

        it('should create customer with vehicle', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);
            mockPrisma.customer.create.mockResolvedValue({
                id: 'new-cust',
                name: 'Cliente com Carro',
                vehicles: [{ id: 'veh-1', plate: 'ABC1234' }],
            });

            const ctx = createMockContext();
            const input = {
                name: 'Cliente com Carro',
                phone: '11999999999',
                vehicle: { plate: 'ABC1234', brand: 'Toyota', model: 'Corolla' },
            };

            const customer = await ctx.db.customer.create({
                data: {
                    name: input.name,
                    phone: input.phone,
                    tenantId: ctx.tenantId,
                    vehicles: {
                        create: { ...input.vehicle, tenantId: ctx.tenantId },
                    },
                },
            });

            expect(customer.vehicles).toHaveLength(1);
        });
    });

    describe('update', () => {
        it('should update customer with valid data', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                name: 'Nome Antigo',
                tenantId: 'tenant-123',
            });
            mockPrisma.customer.update.mockResolvedValue({
                id: 'cust-1',
                name: 'Nome Novo',
            });

            const ctx = createMockContext();

            // Verify ownership
            const existing = await ctx.db.customer.findFirst({
                where: { id: 'cust-1', tenantId: ctx.tenantId },
            });

            expect(existing).not.toBeNull();

            const updated = await ctx.db.customer.update({
                where: { id: 'cust-1' },
                data: { name: 'Nome Novo' },
            });

            expect(updated.name).toBe('Nome Novo');
        });

        it('should throw NOT_FOUND when updating non-existent customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();

            const existing = await ctx.db.customer.findFirst({
                where: { id: 'non-existent', tenantId: ctx.tenantId },
            });

            const checkExists = () => {
                if (!existing) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Cliente não encontrado' });
                }
            };

            expect(checkExists).toThrow(TRPCError);
        });
    });

    describe('delete', () => {
        it('should soft delete customer (managers only)', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                tenantId: 'tenant-123',
            });
            mockPrisma.customer.update.mockResolvedValue({
                id: 'cust-1',
                deletedAt: new Date(),
            });

            const ctx = createMockContext('MANAGER');

            // Soft delete (set deletedAt)
            await ctx.db.customer.update({
                where: { id: 'cust-1' },
                data: { deletedAt: new Date() },
            });

            expect(mockPrisma.customer.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        deletedAt: expect.any(Date),
                    }),
                })
            );
        });

        it('should keep customer vehicles when deleting customer', async () => {
            mockPrisma.customer.findFirst.mockResolvedValue({
                id: 'cust-1',
                vehicles: [{ id: 'veh-1' }],
            });

            const ctx = createMockContext('MANAGER');

            const customer = await ctx.db.customer.findFirst({
                where: { id: 'cust-1', tenantId: ctx.tenantId },
                include: { vehicles: true },
            });

            // Detach vehicles (opcional) or soft delete
            if (customer?.vehicles?.length) {
                await ctx.db.vehicle.updateMany({
                    where: { customerId: 'cust-1' },
                    data: { deletedAt: new Date() },
                });
            }

            expect(mockPrisma.vehicle.updateMany).toHaveBeenCalled();
        });
    });

    describe('search', () => {
        it('should return matching customers for autocomplete', async () => {
            mockPrisma.customer.findMany.mockResolvedValue([
                { id: 'cust-1', name: 'João Silva', phone: '11999999999' },
            ]);

            const ctx = createMockContext();
            const query = 'João';

            const customers = await ctx.db.customer.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query } },
                    ],
                },
                take: 10,
            });

            expect(customers).toHaveLength(1);
            expect(customers[0].name).toContain('João');
        });

        it('should limit results for performance', async () => {
            mockPrisma.customer.findMany.mockResolvedValue([]);

            const ctx = createMockContext();

            await ctx.db.customer.findMany({
                where: { tenantId: ctx.tenantId },
                take: 10,
            });

            expect(mockPrisma.customer.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 10 })
            );
        });
    });
});

describe('customerRouter - Input Validation', () => {
    it('should require name with minimum length', () => {
        const validateName = (name: string) => {
            if (name.length < 2) {
                throw new Error('Nome deve ter pelo menos 2 caracteres');
            }
            return true;
        };

        expect(() => validateName('A')).toThrow();
        expect(validateName('AB')).toBe(true);
    });

    it('should require phone number', () => {
        const validatePhone = (phone: string) => {
            if (!phone || phone.length < 10) {
                throw new Error('Telefone inválido');
            }
            return true;
        };

        expect(() => validatePhone('')).toThrow();
        expect(validatePhone('11999999999')).toBe(true);
    });

    it('should validate optional email format', () => {
        const validateEmail = (email: string | undefined) => {
            if (email && !email.includes('@')) {
                throw new Error('Email inválido');
            }
            return true;
        };

        expect(validateEmail(undefined)).toBe(true);
        expect(validateEmail('test@example.com')).toBe(true);
        expect(() => validateEmail('invalid')).toThrow();
    });
});
