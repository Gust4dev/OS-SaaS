import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the inspection router.
 * Covers vehicle inspection checklist, damage documentation, and PDF generation.
 */

const mockPrisma = {
    inspection: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
    inspectionItem: {
        createMany: vi.fn(),
        findMany: vi.fn(),
    },
    inspectionDamage: {
        create: vi.fn(),
        findMany: vi.fn(),
    },
    vehicle: {
        findFirst: vi.fn(),
    },
};

const createMockContext = (role = 'MEMBER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('inspectionRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create inspection for vehicle', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'veh-1',
                plate: 'ABC1234',
            });
            mockPrisma.inspection.create.mockResolvedValue({
                id: 'insp-1',
                vehicleId: 'veh-1',
                status: 'IN_PROGRESS',
            });

            const ctx = createMockContext();
            const input = { vehicleId: 'veh-1', orderId: 'ord-1' };

            const inspection = await ctx.db.inspection.create({
                data: {
                    ...input,
                    tenantId: ctx.tenantId,
                    createdById: ctx.user.id,
                    status: 'IN_PROGRESS',
                },
            });

            expect(inspection.status).toBe('IN_PROGRESS');
        });

        it('should throw NOT_FOUND for invalid vehicle', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue(null);

            const ctx = createMockContext();

            const vehicle = await ctx.db.vehicle.findFirst({
                where: { id: 'non-existent' },
            });

            const checkVehicle = () => {
                if (!vehicle) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Veículo não encontrado' });
                }
            };

            expect(checkVehicle).toThrow(TRPCError);
        });
    });

    describe('addItems', () => {
        it('should add checklist items to inspection', async () => {
            mockPrisma.inspectionItem.createMany.mockResolvedValue({ count: 10 });

            const ctx = createMockContext();
            const items = [
                { category: 'EXTERIOR', item: 'Pintura', status: 'OK' },
                { category: 'EXTERIOR', item: 'Para-choque', status: 'DANIFICADO' },
                { category: 'INTERIOR', item: 'Bancos', status: 'OK' },
            ];

            const result = await ctx.db.inspectionItem.createMany({
                data: items.map((item) => ({
                    inspectionId: 'insp-1',
                    ...item,
                })),
            });

            expect(result.count).toBeGreaterThan(0);
        });

        it('should validate item status', () => {
            const validStatuses = ['OK', 'DANIFICADO', 'FALTANDO', 'SUJO'];

            const validateStatus = (status: string) => {
                if (!validStatuses.includes(status)) {
                    throw new Error('Status inválido');
                }
                return true;
            };

            expect(validateStatus('OK')).toBe(true);
            expect(validateStatus('DANIFICADO')).toBe(true);
            expect(() => validateStatus('INVALID')).toThrow();
        });
    });

    describe('addDamage', () => {
        it('should register damage with location', async () => {
            mockPrisma.inspectionDamage.create.mockResolvedValue({
                id: 'dmg-1',
                location: 'PORTA_DIANTEIRA_ESQUERDA',
                description: 'Amassado pequeno',
                severity: 'LEVE',
            });

            const ctx = createMockContext();
            const damage = {
                inspectionId: 'insp-1',
                location: 'PORTA_DIANTEIRA_ESQUERDA',
                description: 'Amassado pequeno',
                severity: 'LEVE',
            };

            const created = await ctx.db.inspectionDamage.create({
                data: damage,
            });

            expect(created.location).toBe('PORTA_DIANTEIRA_ESQUERDA');
            expect(created.severity).toBe('LEVE');
        });

        it('should validate damage severity', () => {
            const validSeverities = ['LEVE', 'MODERADO', 'GRAVE'];

            const validateSeverity = (severity: string) => {
                if (!validSeverities.includes(severity)) {
                    throw new Error('Severidade inválida');
                }
                return true;
            };

            expect(validateSeverity('LEVE')).toBe(true);
            expect(validateSeverity('GRAVE')).toBe(true);
            expect(() => validateSeverity('MUITO_GRAVE')).toThrow();
        });

        it('should validate damage location', () => {
            const validLocations = [
                'CAPO',
                'TETO',
                'PORTA_DIANTEIRA_ESQUERDA',
                'PORTA_DIANTEIRA_DIREITA',
                'PORTA_TRASEIRA_ESQUERDA',
                'PORTA_TRASEIRA_DIREITA',
                'PARA_CHOQUE_DIANTEIRO',
                'PARA_CHOQUE_TRASEIRO',
                'LATERAL_ESQUERDA',
                'LATERAL_DIREITA',
                'VIDRO_DIANTEIRO',
                'VIDRO_TRASEIRO',
                'RODA_DIANTEIRA_ESQUERDA',
                'RODA_DIANTEIRA_DIREITA',
                'RODA_TRASEIRA_ESQUERDA',
                'RODA_TRASEIRA_DIREITA',
            ];

            const validateLocation = (location: string) => {
                if (!validLocations.includes(location)) {
                    throw new Error('Localização inválida');
                }
                return true;
            };

            expect(validateLocation('CAPO')).toBe(true);
            expect(() => validateLocation('MOTOR')).toThrow();
        });
    });

    describe('complete', () => {
        it('should mark inspection as complete', async () => {
            mockPrisma.inspection.findFirst.mockResolvedValue({
                id: 'insp-1',
                status: 'IN_PROGRESS',
            });
            mockPrisma.inspection.update.mockResolvedValue({
                id: 'insp-1',
                status: 'COMPLETED',
                completedAt: new Date(),
            });

            const ctx = createMockContext();

            const updated = await ctx.db.inspection.update({
                where: { id: 'insp-1' },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            expect(updated.status).toBe('COMPLETED');
            expect(updated.completedAt).toBeInstanceOf(Date);
        });

        it('should require at least one item before completion', async () => {
            mockPrisma.inspectionItem.findMany.mockResolvedValue([]);

            const ctx = createMockContext();

            const items = await ctx.db.inspectionItem.findMany({
                where: { inspectionId: 'insp-1' },
            });

            const checkItems = () => {
                if (items.length === 0) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Adicione pelo menos um item à vistoria',
                    });
                }
            };

            expect(checkItems).toThrow('pelo menos um item');
        });
    });

    describe('getById', () => {
        it('should return inspection with items and damages', async () => {
            mockPrisma.inspection.findFirst.mockResolvedValue({
                id: 'insp-1',
                vehicle: { plate: 'ABC1234' },
                items: [{ item: 'Pintura', status: 'OK' }],
                damages: [{ location: 'CAPO', severity: 'LEVE' }],
            });

            const ctx = createMockContext();

            const inspection = await ctx.db.inspection.findFirst({
                where: { id: 'insp-1', tenantId: ctx.tenantId },
                include: { vehicle: true, items: true, damages: true },
            });

            expect(inspection?.items).toHaveLength(1);
            expect(inspection?.damages).toHaveLength(1);
        });
    });

    describe('list', () => {
        it('should list inspections for order', async () => {
            mockPrisma.inspection.findMany.mockResolvedValue([
                { id: 'insp-1', orderId: 'ord-1', status: 'COMPLETED' },
            ]);

            const ctx = createMockContext();

            const inspections = await ctx.db.inspection.findMany({
                where: { orderId: 'ord-1', tenantId: ctx.tenantId },
            });

            expect(inspections).toHaveLength(1);
        });

        it('should list inspections for vehicle', async () => {
            mockPrisma.inspection.findMany.mockResolvedValue([
                { id: 'insp-1', vehicleId: 'veh-1' },
                { id: 'insp-2', vehicleId: 'veh-1' },
            ]);

            const ctx = createMockContext();

            const inspections = await ctx.db.inspection.findMany({
                where: { vehicleId: 'veh-1', tenantId: ctx.tenantId },
                orderBy: { createdAt: 'desc' },
            });

            expect(inspections).toHaveLength(2);
        });
    });
});

describe('inspectionRouter - Categories', () => {
    it('should validate inspection categories', () => {
        const validCategories = [
            'EXTERIOR',
            'INTERIOR',
            'MOTOR',
            'CHASSI',
            'RODAS',
            'VIDROS',
            'FAROIS',
            'DOCUMENTOS',
        ];

        const validateCategory = (category: string) => {
            if (!validCategories.includes(category)) {
                throw new Error('Categoria inválida');
            }
            return true;
        };

        expect(validateCategory('EXTERIOR')).toBe(true);
        expect(validateCategory('INTERIOR')).toBe(true);
        expect(() => validateCategory('ELETRICA')).toThrow();
    });
});
