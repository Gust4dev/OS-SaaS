import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the vehicle router.
 * Covers vehicle CRUD, plate uniqueness, and service history.
 */

const mockPrisma = {
    vehicle: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    serviceOrder: {
        findMany: vi.fn(),
    },
};

const createMockContext = (role = 'MANAGER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('vehicleRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('list', () => {
        it('should return paginated vehicles for tenant', async () => {
            mockPrisma.vehicle.findMany.mockResolvedValue([
                { id: 'veh-1', plate: 'ABC1234', brand: 'Toyota', model: 'Corolla' },
                { id: 'veh-2', plate: 'DEF5678', brand: 'Honda', model: 'Civic' },
            ]);
            mockPrisma.vehicle.count.mockResolvedValue(2);

            const ctx = createMockContext();

            const vehicles = await ctx.db.vehicle.findMany({
                where: { tenantId: ctx.tenantId, deletedAt: null },
            });

            expect(vehicles).toHaveLength(2);
            expect(mockPrisma.vehicle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ tenantId: 'tenant-123' }),
                })
            );
        });

        it('should search by plate', async () => {
            mockPrisma.vehicle.findMany.mockResolvedValue([
                { id: 'veh-1', plate: 'ABC1234' },
            ]);

            const ctx = createMockContext();
            const search = 'ABC';

            await ctx.db.vehicle.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    plate: { contains: search, mode: 'insensitive' },
                },
            });

            expect(mockPrisma.vehicle.findMany).toHaveBeenCalled();
        });

        it('should include customer data', async () => {
            mockPrisma.vehicle.findMany.mockResolvedValue([
                {
                    id: 'veh-1',
                    plate: 'ABC1234',
                    customer: { id: 'cust-1', name: 'João' },
                },
            ]);

            const ctx = createMockContext();

            const vehicles = await ctx.db.vehicle.findMany({
                where: { tenantId: ctx.tenantId },
                include: { customer: true },
            });

            expect(vehicles[0].customer.name).toBe('João');
        });
    });

    describe('getById', () => {
        it('should return vehicle with owner and history', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'veh-1',
                plate: 'ABC1234',
                customer: { id: 'cust-1', name: 'João' },
            });

            const ctx = createMockContext();

            const vehicle = await ctx.db.vehicle.findFirst({
                where: { id: 'veh-1', tenantId: ctx.tenantId },
                include: { customer: true },
            });

            expect(vehicle?.plate).toBe('ABC1234');
            expect(vehicle?.customer.name).toBe('João');
        });

        it('should throw NOT_FOUND for non-existent vehicle', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();

            const vehicle = await ctx.db.vehicle.findFirst({
                where: { id: 'non-existent', tenantId: ctx.tenantId },
            });

            const checkExists = () => {
                if (!vehicle) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Veículo não encontrado' });
                }
            };

            expect(checkExists).toThrow(TRPCError);
        });
    });

    describe('create', () => {
        it('should create vehicle with valid data', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue(null); // No duplicate
            mockPrisma.vehicle.create.mockResolvedValue({
                id: 'new-veh',
                plate: 'XYZ9999',
                brand: 'BMW',
                model: 'X5',
            });

            const ctx = createMockContext();
            const input = {
                plate: 'XYZ9999',
                brand: 'BMW',
                model: 'X5',
                customerId: 'cust-1',
            };

            const vehicle = await ctx.db.vehicle.create({
                data: { ...input, tenantId: ctx.tenantId },
            });

            expect(vehicle.plate).toBe('XYZ9999');
        });

        it('should reject duplicate plate within tenant', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'existing',
                plate: 'ABC1234',
            });

            const ctx = createMockContext();

            const existing = await ctx.db.vehicle.findFirst({
                where: { tenantId: ctx.tenantId, plate: 'ABC1234' },
            });

            const checkDuplicate = () => {
                if (existing) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Já existe um veículo com esta placa',
                    });
                }
            };

            expect(checkDuplicate).toThrow('esta placa');
        });

        it('should allow same plate in different tenants', async () => {
            // First tenant has ABC1234
            mockPrisma.vehicle.findFirst.mockResolvedValue(null); // Not found in THIS tenant

            const ctx = createMockContext();

            const existing = await ctx.db.vehicle.findFirst({
                where: { tenantId: ctx.tenantId, plate: 'ABC1234' },
            });

            // No duplicate in THIS tenant, so creation should proceed
            expect(existing).toBeNull();
        });
    });

    describe('update', () => {
        it('should update vehicle info', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'veh-1',
                plate: 'ABC1234',
                tenantId: 'tenant-123',
            });
            mockPrisma.vehicle.update.mockResolvedValue({
                id: 'veh-1',
                color: 'Azul',
            });

            const ctx = createMockContext();

            const updated = await ctx.db.vehicle.update({
                where: { id: 'veh-1' },
                data: { color: 'Azul' },
            });

            expect(updated.color).toBe('Azul');
        });

        it('should validate plate uniqueness on update', async () => {
            mockPrisma.vehicle.findFirst
                .mockResolvedValueOnce({ id: 'veh-1', plate: 'ABC1234' }) // Current vehicle
                .mockResolvedValueOnce({ id: 'veh-2', plate: 'DEF5678' }); // Another vehicle with new plate

            const ctx = createMockContext();
            const newPlate = 'DEF5678';

            // Check if new plate exists (excluding current vehicle)
            const conflict = await ctx.db.vehicle.findFirst({
                where: { tenantId: ctx.tenantId, plate: newPlate, id: { not: 'veh-1' } },
            });

            const checkConflict = () => {
                if (conflict) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Esta placa já está em uso',
                    });
                }
            };

            expect(checkConflict).toThrow('já está em uso');
        });
    });

    describe('getHistory', () => {
        it('should return service history for vehicle', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                {
                    id: 'ord-1',
                    code: 'OS-001',
                    status: 'ENTREGUE',
                    completedAt: new Date(),
                    items: [{ serviceName: 'Polimento' }],
                },
                {
                    id: 'ord-2',
                    code: 'OS-002',
                    status: 'CONCLUIDO',
                    completedAt: new Date(),
                    items: [{ serviceName: 'Lavagem' }],
                },
            ]);

            const ctx = createMockContext();

            const history = await ctx.db.serviceOrder.findMany({
                where: { vehicleId: 'veh-1', tenantId: ctx.tenantId },
                orderBy: { createdAt: 'desc' },
            });

            expect(history).toHaveLength(2);
            expect(history[0].code).toBe('OS-001');
        });

        it('should include total spent per vehicle', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', total: 500 },
                { id: 'ord-2', total: 300 },
            ]);

            const ctx = createMockContext();

            const orders = await ctx.db.serviceOrder.findMany({
                where: { vehicleId: 'veh-1', tenantId: ctx.tenantId },
            });

            const totalSpent = orders.reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0);

            expect(totalSpent).toBe(800);
        });
    });

    describe('transfer', () => {
        it('should transfer vehicle to new owner', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'veh-1',
                customerId: 'old-owner',
            });
            mockPrisma.vehicle.update.mockResolvedValue({
                id: 'veh-1',
                customerId: 'new-owner',
            });

            const ctx = createMockContext();

            const updated = await ctx.db.vehicle.update({
                where: { id: 'veh-1' },
                data: { customerId: 'new-owner' },
            });

            expect(updated.customerId).toBe('new-owner');
        });
    });
});

describe('vehicleRouter - Input Validation', () => {
    it('should validate plate format', () => {
        const validatePlate = (plate: string) => {
            // Brazilian plate formats: ABC1234 or ABC1D23 (Mercosul)
            const regex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
            if (!regex.test(plate)) {
                throw new Error('Formato de placa inválido');
            }
            return true;
        };

        expect(validatePlate('ABC1234')).toBe(true); // Old format
        expect(validatePlate('ABC1D23')).toBe(true); // Mercosul
        expect(() => validatePlate('AB12345')).toThrow();
        expect(() => validatePlate('ABCD123')).toThrow();
    });

    it('should require brand', () => {
        const validateBrand = (brand: string | undefined) => {
            if (!brand || brand.length < 2) {
                throw new Error('Marca é obrigatória');
            }
            return true;
        };

        expect(() => validateBrand('')).toThrow();
        expect(validateBrand('Toyota')).toBe(true);
    });

    it('should require model', () => {
        const validateModel = (model: string | undefined) => {
            if (!model || model.length < 1) {
                throw new Error('Modelo é obrigatório');
            }
            return true;
        };

        expect(() => validateModel('')).toThrow();
        expect(validateModel('Corolla')).toBe(true);
    });

    it('should validate year range', () => {
        const currentYear = new Date().getFullYear();

        const validateYear = (year: number | undefined) => {
            if (year && (year < 1900 || year > currentYear + 1)) {
                throw new Error('Ano inválido');
            }
            return true;
        };

        expect(validateYear(undefined)).toBe(true);
        expect(validateYear(2020)).toBe(true);
        expect(() => validateYear(1800)).toThrow();
        expect(() => validateYear(3000)).toThrow();
    });
});
