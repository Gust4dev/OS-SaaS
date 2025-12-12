import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { OrderStatus as PrismaOrderStatus } from '@prisma/client';

// Valid status transitions
const validTransitions: Record<string, string[]> = {
    AGENDADO: ['EM_VISTORIA', 'CANCELADO'],
    EM_VISTORIA: ['EM_EXECUCAO', 'CANCELADO'],
    EM_EXECUCAO: ['AGUARDANDO_PAGAMENTO', 'CANCELADO'],
    AGUARDANDO_PAGAMENTO: ['CONCLUIDO'],
    CONCLUIDO: [],
    CANCELADO: [],
};

// Input schemas
const orderItemSchema = z.object({
    serviceId: z.string().optional(),
    customName: z.string().optional(),
    price: z.number().min(0),
    quantity: z.number().min(1).default(1),
    notes: z.string().optional(),
});

const orderProductSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
});

const orderCreateSchema = z.object({
    vehicleId: z.string(),
    scheduledAt: z.date(),
    assignedToId: z.string(),
    items: z.array(orderItemSchema).min(1, 'Adicione pelo menos um serviço'),
    products: z.array(orderProductSchema).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().min(0).optional(),
});

const orderUpdateSchema = z.object({
    scheduledAt: z.date().optional(),
    assignedToId: z.string().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().min(0).optional(),
});

const orderListSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.array(z.enum(['AGENDADO', 'EM_VISTORIA', 'EM_EXECUCAO', 'AGUARDANDO_PAGAMENTO', 'CONCLUIDO', 'CANCELADO'])).optional(),
    assignedToId: z.string().optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
});

const paymentSchema = z.object({
    orderId: z.string(),
    method: z.enum(['PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'TRANSFERENCIA']),
    amount: z.number().min(0.01),
    notes: z.string().optional(),
});

// Helper to generate order code
function generateOrderCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `OS-${year}-${random}`;
}

// Helper to calculate order totals
function calculateTotals(
    items: { price: number; quantity: number }[],
    discountType?: string,
    discountValue?: number
) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;

    if (discountType && discountValue) {
        discount = discountType === 'PERCENTAGE'
            ? subtotal * (discountValue / 100)
            : discountValue;
    }

    const total = Math.max(0, subtotal - discount);
    return { subtotal, discount, total };
}

export const orderRouter = router({
    // List orders with filters
    list: protectedProcedure
        .input(orderListSchema)
        .query(async ({ ctx, input }) => {
            const { page, limit, search, status, assignedToId, dateFrom, dateTo } = input;
            const skip = (page - 1) * limit;

            const where = {
                tenantId: ctx.tenantId!,
                ...(status && status.length > 0 && { status: { in: status as PrismaOrderStatus[] } }),
                ...(assignedToId && { assignedToId }),
                ...(dateFrom && dateTo && {
                    scheduledAt: { gte: dateFrom, lte: dateTo },
                }),
                ...(search && {
                    OR: [
                        { code: { contains: search, mode: 'insensitive' as const } },
                        { vehicle: { plate: { contains: search, mode: 'insensitive' as const } } },
                        { vehicle: { customer: { name: { contains: search, mode: 'insensitive' as const } } } },
                    ],
                }),
            };

            const [orders, total] = await Promise.all([
                ctx.db.serviceOrder.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { scheduledAt: 'desc' },
                    include: {
                        vehicle: {
                            include: {
                                customer: { select: { id: true, name: true, phone: true } },
                            },
                        },
                        assignedTo: { select: { id: true, name: true } },
                        _count: { select: { items: true, payments: true } },
                    },
                }),
                ctx.db.serviceOrder.count({ where }),
            ]);

            return {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }),

    // Get single order with full details
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const order = await ctx.db.serviceOrder.findFirst({
                where: {
                    id: input.id,
                    tenantId: ctx.tenantId!,
                },
                include: {
                    vehicle: {
                        include: { customer: true },
                    },
                    assignedTo: { select: { id: true, name: true, avatarUrl: true } },
                    createdBy: { select: { id: true, name: true } },
                    items: {
                        include: { service: { select: { id: true, name: true } } },
                    },
                    products: {
                        include: { product: { select: { id: true, name: true, unit: true } } },
                    },
                    payments: {
                        orderBy: { paidAt: 'desc' },
                    },
                    inspection: true,
                },
            });

            if (!order) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ordem de serviço não encontrada',
                });
            }

            // Calculate paid amount
            const paidAmount = order.payments.reduce(
                (sum, p) => sum + Number(p.amount),
                0
            );

            return {
                ...order,
                paidAmount,
                balance: Number(order.total) - paidAmount,
            };
        }),

    // Create new order
    create: protectedProcedure
        .input(orderCreateSchema)
        .mutation(async ({ ctx, input }) => {
            // Verify vehicle belongs to tenant
            const vehicle = await ctx.db.vehicle.findFirst({
                where: { id: input.vehicleId, tenantId: ctx.tenantId! },
            });

            if (!vehicle) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Veículo não encontrado',
                });
            }

            // Verify assigned user belongs to tenant
            const assignedUser = await ctx.db.user.findFirst({
                where: { id: input.assignedToId, tenantId: ctx.tenantId! },
            });

            if (!assignedUser) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Responsável não encontrado',
                });
            }

            // Calculate totals
            const { subtotal, total } = calculateTotals(
                input.items,
                input.discountType,
                input.discountValue
            );

            // Create order with items
            const order = await ctx.db.serviceOrder.create({
                data: {
                    code: generateOrderCode(),
                    status: 'AGENDADO',
                    scheduledAt: input.scheduledAt,
                    vehicleId: input.vehicleId,
                    assignedToId: input.assignedToId,
                    createdById: ctx.user!.id,
                    tenantId: ctx.tenantId!,
                    subtotal,
                    discountType: input.discountType,
                    discountValue: input.discountValue,
                    total,
                    items: {
                        create: input.items.map((item) => ({
                            serviceId: item.serviceId,
                            customName: item.customName,
                            price: item.price,
                            quantity: item.quantity,
                            notes: item.notes,
                        })),
                    },
                    ...(input.products && input.products.length > 0 && {
                        products: {
                            create: input.products.map((p) => ({
                                productId: p.productId,
                                quantity: p.quantity,
                            })),
                        },
                    }),
                },
                include: {
                    vehicle: { include: { customer: true } },
                    items: true,
                },
            });

            return order;
        }),

    // Update order basic info
    update: protectedProcedure
        .input(z.object({ id: z.string(), data: orderUpdateSchema }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.serviceOrder.findFirst({
                where: { id: input.id, tenantId: ctx.tenantId! },
                include: { items: true },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ordem de serviço não encontrada',
                });
            }

            // Recalculate if discount changed
            const items = existing.items.map((i) => ({
                price: Number(i.price),
                quantity: i.quantity,
            }));

            const { subtotal, total } = calculateTotals(
                items,
                input.data.discountType || existing.discountType || undefined,
                input.data.discountValue !== undefined
                    ? input.data.discountValue
                    : Number(existing.discountValue) || undefined
            );

            const order = await ctx.db.serviceOrder.update({
                where: { id: input.id },
                data: {
                    ...input.data,
                    subtotal,
                    total,
                },
            });

            return order;
        }),

    // Update order status
    updateStatus: protectedProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(['AGENDADO', 'EM_VISTORIA', 'EM_EXECUCAO', 'AGUARDANDO_PAGAMENTO', 'CONCLUIDO', 'CANCELADO']),
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.serviceOrder.findFirst({
                where: { id: input.id, tenantId: ctx.tenantId! },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ordem de serviço não encontrada',
                });
            }

            // Validate status transition
            const allowedNext = validTransitions[existing.status] || [];
            if (!allowedNext.includes(input.status)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `Não é possível mudar de ${existing.status} para ${input.status}`,
                });
            }

            // Set timestamps based on status
            const timestamps: Record<string, Date> = {};
            if (input.status === 'EM_EXECUCAO' && !existing.startedAt) {
                timestamps.startedAt = new Date();
            }
            if (input.status === 'CONCLUIDO') {
                timestamps.completedAt = new Date();
            }

            const order = await ctx.db.serviceOrder.update({
                where: { id: input.id },
                data: {
                    status: input.status,
                    ...timestamps,
                },
            });

            return order;
        }),

    // Add payment
    addPayment: protectedProcedure
        .input(paymentSchema)
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.db.serviceOrder.findFirst({
                where: { id: input.orderId, tenantId: ctx.tenantId! },
                include: { payments: true },
            });

            if (!order) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Ordem de serviço não encontrada',
                });
            }

            const currentPaid = order.payments.reduce(
                (sum, p) => sum + Number(p.amount),
                0
            );

            if (currentPaid + input.amount > Number(order.total)) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Valor do pagamento excede o saldo devedor',
                });
            }

            const payment = await ctx.db.payment.create({
                data: {
                    orderId: input.orderId,
                    method: input.method,
                    amount: input.amount,
                    receivedBy: ctx.user!.id,
                    notes: input.notes,
                },
            });

            return payment;
        }),

    // Get dashboard stats
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayOrders, inProgress, monthRevenue] = await Promise.all([
            ctx.db.serviceOrder.count({
                where: {
                    tenantId: ctx.tenantId!,
                    scheduledAt: { gte: today, lt: tomorrow },
                },
            }),
            ctx.db.serviceOrder.count({
                where: {
                    tenantId: ctx.tenantId!,
                    status: { in: ['EM_VISTORIA', 'EM_EXECUCAO'] },
                },
            }),
            ctx.db.serviceOrder.aggregate({
                where: {
                    tenantId: ctx.tenantId!,
                    status: 'CONCLUIDO',
                    completedAt: {
                        gte: new Date(today.getFullYear(), today.getMonth(), 1),
                    },
                },
                _sum: { total: true },
            }),
        ]);

        return {
            todayOrders,
            inProgress,
            monthRevenue: Number(monthRevenue._sum.total) || 0,
        };
    }),

    // Get recent orders for dashboard
    getRecent: protectedProcedure
        .input(z.object({ limit: z.number().default(5) }))
        .query(async ({ ctx, input }) => {
            const orders = await ctx.db.serviceOrder.findMany({
                where: { tenantId: ctx.tenantId! },
                take: input.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vehicle: {
                        include: {
                            customer: { select: { name: true } },
                        },
                    },
                    items: {
                        include: { service: { select: { name: true } } },
                    },
                },
            });

            return orders;
        }),
});
