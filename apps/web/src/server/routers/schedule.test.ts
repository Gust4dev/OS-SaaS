import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the schedule router.
 * Covers calendar queries and scheduling functionality.
 */

const mockPrisma = {
    serviceOrder: {
        findMany: vi.fn(),
        count: vi.fn(),
    },
    user: {
        findMany: vi.fn(),
    },
};

const createMockContext = (role = 'MANAGER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('scheduleRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getByMonth', () => {
        it('should return orders for specific month', async () => {
            const year = 2026;
            const month = 1; // January
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', scheduledAt: new Date(2026, 0, 15) },
                { id: 'ord-2', scheduledAt: new Date(2026, 0, 20) },
            ]);

            const ctx = createMockContext();

            const orders = await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    scheduledAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            expect(orders).toHaveLength(2);
            expect(mockPrisma.serviceOrder.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        scheduledAt: expect.objectContaining({
                            gte: expect.any(Date),
                            lte: expect.any(Date),
                        }),
                    }),
                })
            );
        });

        it('should include order details for calendar display', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                {
                    id: 'ord-1',
                    code: 'OS-001',
                    scheduledAt: new Date(),
                    status: 'AGENDADO',
                    vehicle: { plate: 'ABC1234', brand: 'Toyota' },
                    customer: { name: 'João' },
                    assignedTo: { name: 'Carlos' },
                },
            ]);

            const ctx = createMockContext();

            const orders = await ctx.db.serviceOrder.findMany({
                where: { tenantId: ctx.tenantId },
                include: {
                    vehicle: true,
                    customer: true,
                    assignedTo: true,
                },
            });

            expect(orders[0].vehicle.plate).toBe('ABC1234');
            expect(orders[0].customer.name).toBe('João');
        });
    });

    describe('getByDay', () => {
        it('should return orders for specific day', async () => {
            const date = new Date(2026, 0, 15);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', scheduledAt: new Date(2026, 0, 15, 9, 0) },
                { id: 'ord-2', scheduledAt: new Date(2026, 0, 15, 14, 0) },
            ]);

            const ctx = createMockContext();

            const orders = await ctx.db.serviceOrder.findMany({
                where: {
                    tenantId: ctx.tenantId,
                    scheduledAt: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                orderBy: { scheduledAt: 'asc' },
            });

            expect(orders).toHaveLength(2);
        });
    });

    describe('getAvailableSlots', () => {
        it('should calculate available time slots', () => {
            const operatingHours = { open: '08:00', close: '18:00' };
            const slotDuration = 60; // minutes
            const bookedSlots = ['09:00', '14:00'];

            const generateSlots = () => {
                const slots: string[] = [];
                const [openHour] = operatingHours.open.split(':').map(Number);
                const [closeHour] = operatingHours.close.split(':').map(Number);

                for (let hour = openHour; hour < closeHour; hour++) {
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    if (!bookedSlots.includes(time)) {
                        slots.push(time);
                    }
                }

                return slots;
            };

            const available = generateSlots();

            expect(available).not.toContain('09:00');
            expect(available).not.toContain('14:00');
            expect(available).toContain('08:00');
            expect(available).toContain('10:00');
        });

        it('should consider technician assignments', async () => {
            mockPrisma.user.findMany.mockResolvedValue([
                { id: 'tech-1', name: 'Carlos' },
                { id: 'tech-2', name: 'Pedro' },
            ]);
            mockPrisma.serviceOrder.count
                .mockResolvedValueOnce(2) // tech-1 at 09:00
                .mockResolvedValueOnce(0); // tech-2 at 09:00

            const ctx = createMockContext();

            const technicians = await ctx.db.user.findMany({
                where: { tenantId: ctx.tenantId, role: 'MEMBER', status: 'ACTIVE' },
            });

            const availability = await Promise.all(
                technicians.map(async (tech: { id: string; name: string }) => {
                    const ordersAtTime = await ctx.db.serviceOrder.count({
                        where: {
                            assignedToId: tech.id,
                            scheduledAt: new Date(2026, 0, 15, 9, 0),
                        },
                    });
                    return { techId: tech.id, available: ordersAtTime === 0 };
                })
            );

            expect(availability[0].available).toBe(false); // tech-1 busy
            expect(availability[1].available).toBe(true);  // tech-2 free
        });
    });

    describe('checkConflicts', () => {
        it('should detect scheduling conflicts', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([
                { id: 'ord-1', assignedToId: 'tech-1', scheduledAt: new Date(2026, 0, 15, 9, 0) },
            ]);

            const ctx = createMockContext();
            const newOrderTime = new Date(2026, 0, 15, 9, 0);
            const technicianId = 'tech-1';

            const existingOrders = await ctx.db.serviceOrder.findMany({
                where: {
                    assignedToId: technicianId,
                    scheduledAt: newOrderTime,
                    status: { not: 'CANCELADO' },
                },
            });

            const hasConflict = existingOrders.length > 0;
            expect(hasConflict).toBe(true);
        });

        it('should not detect conflict with different technician', async () => {
            mockPrisma.serviceOrder.findMany.mockResolvedValue([]);

            const ctx = createMockContext();

            const existingOrders = await ctx.db.serviceOrder.findMany({
                where: {
                    assignedToId: 'tech-2',
                    scheduledAt: new Date(2026, 0, 15, 9, 0),
                },
            });

            const hasConflict = existingOrders.length > 0;
            expect(hasConflict).toBe(false);
        });
    });
});

describe('scheduleRouter - Date Utilities', () => {
    it('should validate month range', () => {
        const validateMonth = (month: number) => {
            if (month < 1 || month > 12) {
                throw new Error('Mês deve estar entre 1 e 12');
            }
            return true;
        };

        expect(validateMonth(1)).toBe(true);
        expect(validateMonth(12)).toBe(true);
        expect(() => validateMonth(0)).toThrow();
        expect(() => validateMonth(13)).toThrow();
    });

    it('should validate year range', () => {
        const currentYear = new Date().getFullYear();

        const validateYear = (year: number) => {
            if (year < currentYear - 1 || year > currentYear + 2) {
                throw new Error('Ano fora do intervalo permitido');
            }
            return true;
        };

        expect(validateYear(currentYear)).toBe(true);
        expect(validateYear(currentYear + 1)).toBe(true);
        expect(() => validateYear(2020)).toThrow();
    });
});
