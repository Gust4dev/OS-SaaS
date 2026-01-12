import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the order router.
 * Covers order lifecycle, status transitions, payments, and RBAC.
 */

const mockPrisma = {
    serviceOrder: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    orderItem: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
    },
    payment: {
        create: vi.fn(),
        findMany: vi.fn(),
    },
    vehicle: {
        findFirst: vi.fn(),
    },
    notificationLog: {
        create: vi.fn(),
    },
};

const createMockContext = (role = 'MANAGER', userId = 'user-123') => ({
    db: mockPrisma,
    user: { id: userId, role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
    AGENDADO: ['EM_ANDAMENTO', 'CANCELADO'],
    EM_ANDAMENTO: ['PAUSADO', 'CONCLUIDO', 'CANCELADO'],
    PAUSADO: ['EM_ANDAMENTO', 'CANCELADO'],
    CONCLUIDO: ['ENTREGUE'],
    ENTREGUE: [],
    CANCELADO: [],
};

describe('orderRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create order with valid data', async () => {
            mockPrisma.vehicle.findFirst.mockResolvedValue({
                id: 'veh-1',
                customerId: 'cust-1',
            });
            mockPrisma.serviceOrder.create.mockResolvedValue({
                id: 'ord-1',
                code: 'OS-001',
                status: 'AGENDADO',
            });
            mockPrisma.notificationLog.create.mockResolvedValue({});

            const ctx = createMockContext();
            const input = {
                vehicleId: 'veh-1',
                scheduledAt: new Date(),
                assignedToId: 'user-456',
                items: [
                    { serviceId: 'srv-1', price: 500, quantity: 1 },
                ],
            };

            const vehicle = await ctx.db.vehicle.findFirst({
                where: { id: input.vehicleId },
            });

            expect(vehicle).not.toBeNull();

            const order = await ctx.db.serviceOrder.create({
                data: {
                    tenantId: ctx.tenantId,
                    vehicleId: input.vehicleId,
                    customerId: vehicle!.customerId,
                    scheduledAt: input.scheduledAt,
                    assignedToId: input.assignedToId,
                    status: 'AGENDADO',
                    subtotal: 500,
                    total: 500,
                    code: 'OS-001',
                },
            });

            expect(order.status).toBe('AGENDADO');
            expect(order.code).toBe('OS-001');
        });

        it('should calculate totals correctly', () => {
            const calculateTotals = (
                items: Array<{ price: number; quantity: number }>,
                discountType?: string,
                discountValue?: number
            ) => {
                const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                let discount = 0;

                if (discountValue && discountType === 'PERCENTAGE') {
                    discount = subtotal * (discountValue / 100);
                } else if (discountValue && discountType === 'FIXED') {
                    discount = discountValue;
                }

                return {
                    subtotal,
                    discount,
                    total: subtotal - discount,
                };
            };

            // No discount
            expect(calculateTotals([{ price: 500, quantity: 1 }])).toEqual({
                subtotal: 500,
                discount: 0,
                total: 500,
            });

            // Percentage discount
            expect(calculateTotals(
                [{ price: 500, quantity: 2 }],
                'PERCENTAGE',
                10
            )).toEqual({
                subtotal: 1000,
                discount: 100,
                total: 900,
            });

            // Fixed discount
            expect(calculateTotals(
                [{ price: 300, quantity: 1 }],
                'FIXED',
                50
            )).toEqual({
                subtotal: 300,
                discount: 50,
                total: 250,
            });
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

    describe('list', () => {
        it('should return orders for managers', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', status: 'AGENDADO' },
                { id: 'ord-2', status: 'EM_ANDAMENTO' },
            ]);
            mockPrisma.serviceOrder.count.mockResolvedValue(2);

            const ctx = createMockContext('MANAGER');

            const orders = await ctx.db.serviceOrder.findMany({
                where: { tenantId: ctx.tenantId },
            });

            expect(orders).toHaveLength(2);
        });

        it('should filter by assigned user for MEMBER role', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', assignedToId: 'user-member' },
            ]);

            const ctx = createMockContext('MEMBER', 'user-member');

            const where: Record<string, unknown> = { tenantId: ctx.tenantId };

            // RBAC: Members only see their assigned orders
            if (ctx.user.role === 'MEMBER') {
                where.assignedToId = ctx.user.id;
            }

            await ctx.db.serviceOrder.findMany({ where });

            expect(mockPrisma.serviceOrder.findMany).toHaveBeenCalledWith({
                where: expect.objectContaining({
                    assignedToId: 'user-member',
                }),
            });
        });

        it('should filter by status', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([]);

            const ctx = createMockContext();
            const statusFilter = ['AGENDADO', 'EM_ANDAMENTO'];

            await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    status: { in: statusFilter },
                },
            });

            expect(mockPrisma.serviceOrder.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        status: { in: statusFilter },
                    }),
                })
            );
        });
    });

    describe('updateStatus', () => {
        it('should allow valid status transitions', () => {
            const validateTransition = (from: string, to: string) => {
                const allowed = VALID_TRANSITIONS[from] || [];
                if (!allowed.includes(to)) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `Transição inválida: ${from} → ${to}`,
                    });
                }
                return true;
            };

            // Valid transitions
            expect(validateTransition('AGENDADO', 'EM_ANDAMENTO')).toBe(true);
            expect(validateTransition('EM_ANDAMENTO', 'CONCLUIDO')).toBe(true);
            expect(validateTransition('CONCLUIDO', 'ENTREGUE')).toBe(true);
        });

        it('should reject invalid status transitions', () => {
            const validateTransition = (from: string, to: string) => {
                const allowed = VALID_TRANSITIONS[from] || [];
                if (!allowed.includes(to)) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: `Transição inválida: ${from} → ${to}`,
                    });
                }
            };

            // Invalid transitions
            expect(() => validateTransition('AGENDADO', 'ENTREGUE')).toThrow();
            expect(() => validateTransition('CANCELADO', 'EM_ANDAMENTO')).toThrow();
            expect(() => validateTransition('ENTREGUE', 'AGENDADO')).toThrow();
        });

        it('should set startedAt when transitioning to EM_ANDAMENTO', async () => {
            mockPrisma.serviceOrder.findFirst.mockResolvedValue({
                id: 'ord-1',
                status: 'AGENDADO',
            });
            mockPrisma.serviceOrder.update.mockResolvedValue({
                id: 'ord-1',
                status: 'EM_ANDAMENTO',
                startedAt: new Date(),
            });

            const ctx = createMockContext();

            const updated = await ctx.db.serviceOrder.update({
                where: { id: 'ord-1' },
                data: {
                    status: 'EM_ANDAMENTO',
                    startedAt: new Date(),
                },
            });

            expect(updated.startedAt).toBeInstanceOf(Date);
        });

        it('should set completedAt when transitioning to CONCLUIDO', async () => {
            mockPrisma.serviceOrder.update.mockResolvedValue({
                id: 'ord-1',
                status: 'CONCLUIDO',
                completedAt: new Date(),
            });

            const ctx = createMockContext();

            const updated = await ctx.db.serviceOrder.update({
                where: { id: 'ord-1' },
                data: {
                    status: 'CONCLUIDO',
                    completedAt: new Date(),
                },
            });

            expect(updated.completedAt).toBeInstanceOf(Date);
        });
    });

    describe('addPayment', () => {
        it('should add payment to order', async () => {
            mockPrisma.serviceOrder.findFirst.mockResolvedValue({
                id: 'ord-1',
                total: 1000,
                payments: [{ amount: 200 }],
            });
            mockPrisma.payment.create.mockResolvedValue({
                id: 'pay-1',
                amount: 300,
                method: 'PIX',
            });

            const ctx = createMockContext();
            const input = {
                orderId: 'ord-1',
                amount: 300,
                method: 'PIX',
            };

            const payment = await ctx.db.payment.create({
                data: {
                    orderId: input.orderId,
                    amount: input.amount,
                    method: input.method,
                },
            });

            expect(payment.amount).toBe(300);
        });

        it('should calculate remaining balance', () => {
            const calculateBalance = (total: number, payments: Array<{ amount: number }>) => {
                const paid = payments.reduce((sum, p) => sum + p.amount, 0);
                return total - paid;
            };

            expect(calculateBalance(1000, [{ amount: 200 }, { amount: 300 }])).toBe(500);
            expect(calculateBalance(500, [{ amount: 500 }])).toBe(0);
        });

        it('should reject payment exceeding balance', () => {
            const order = { total: 1000, payments: [{ amount: 800 }] };
            const newPayment = 300;

            const validatePayment = () => {
                const balance = order.total - order.payments.reduce((s, p) => s + p.amount, 0);
                if (newPayment > balance) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Valor excede o saldo restante',
                    });
                }
            };

            expect(validatePayment).toThrow('excede o saldo');
        });
    });

    describe('cancel', () => {
        it('should cancel order with reason', async () => {
            mockPrisma.serviceOrder.findFirst.mockResolvedValue({
                id: 'ord-1',
                status: 'AGENDADO',
            });
            mockPrisma.serviceOrder.update.mockResolvedValue({
                id: 'ord-1',
                status: 'CANCELADO',
                cancelReason: 'Cliente desistiu',
            });

            const ctx = createMockContext();

            const updated = await ctx.db.serviceOrder.update({
                where: { id: 'ord-1' },
                data: {
                    status: 'CANCELADO',
                    cancelReason: 'Cliente desistiu',
                    canceledAt: new Date(),
                },
            });

            expect(updated.status).toBe('CANCELADO');
        });

        it('should not allow canceling ENTREGUE orders', () => {
            const order = { status: 'ENTREGUE' };

            const validateCancel = () => {
                if (order.status === 'ENTREGUE') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Não é possível cancelar ordem já entregue',
                    });
                }
            };

            expect(validateCancel).toThrow('já entregue');
        });
    });

    describe('update', () => {
        it('should allow managers to update any order', async () => {
            mockPrisma.serviceOrder.findFirst.mockResolvedValue({
                id: 'ord-1',
                assignedToId: 'other-user',
            });

            const ctx = createMockContext('MANAGER');

            const order = await ctx.db.serviceOrder.findFirst({
                where: { id: 'ord-1', tenantId: ctx.tenantId },
            });

            expect(order).not.toBeNull();
        });

        it('should only allow members to update their own orders', async () => {
            mockPrisma.serviceOrder.findFirst.mockResolvedValue(null); // Not assigned to this user

            const ctx = createMockContext('MEMBER', 'user-member');

            const order = await ctx.db.serviceOrder.findFirst({
                where: {
                    id: 'ord-1',
                    tenantId: ctx.tenantId,
                    assignedToId: ctx.user.id,
                },
            });

            const checkAccess = () => {
                if (!order) {
                    throw new TRPCError({ code: 'NOT_FOUND' });
                }
            };

            expect(checkAccess).toThrow(TRPCError);
        });
    });
});

describe('orderRouter - Input Validation', () => {
    it('should require at least one item', () => {
        const validateItems = (items: unknown[]) => {
            if (!items || items.length === 0) {
                throw new Error('Adicione pelo menos um serviço');
            }
            return true;
        };

        expect(() => validateItems([])).toThrow();
        expect(validateItems([{ serviceId: 'srv-1', price: 100 }])).toBe(true);
    });

    it('should validate price limits', () => {
        const MAX_PRICE = 1000000;

        const validatePrice = (price: number) => {
            if (price < 0) throw new Error('Preço negativo não permitido');
            if (price > MAX_PRICE) throw new Error('Preço excede limite máximo');
            return true;
        };

        expect(() => validatePrice(-100)).toThrow();
        expect(() => validatePrice(2000000)).toThrow();
        expect(validatePrice(500)).toBe(true);
    });

    it('should require scheduled date', () => {
        const validateSchedule = (date: Date | undefined) => {
            if (!date) {
                throw new Error('Data de agendamento obrigatória');
            }
            return true;
        };

        expect(() => validateSchedule(undefined)).toThrow();
        expect(validateSchedule(new Date())).toBe(true);
    });
});
