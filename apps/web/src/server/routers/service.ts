import { z } from 'zod';
import { router, protectedProcedure, managerProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const serviceCreateSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    basePrice: z.number().min(0, 'Preço deve ser positivo'),
    estimatedTime: z.number().min(0).optional(),
    returnDays: z.number().min(0).optional(),
    isActive: z.boolean().default(true),
    defaultCommissionPercent: z.number().min(0).max(100).optional(),
    defaultCommissionFixed: z.number().min(0).optional(),
});

const serviceUpdateSchema = serviceCreateSchema.partial();

const serviceListSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const serviceRouter = router({
    // List services with pagination
    list: protectedProcedure
        .input(serviceListSchema)
        .query(async ({ ctx, input }) => {
            const { page, limit, search, isActive } = input;
            const skip = (page - 1) * limit;

            const where = {
                tenantId: ctx.tenantId!,
                ...(isActive !== undefined && { isActive }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' as const } },
                        { description: { contains: search, mode: 'insensitive' as const } },
                    ],
                }),
            };

            const [services, total] = await Promise.all([
                ctx.db.service.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                }),
                ctx.db.service.count({ where }),
            ]);

            return {
                services,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        }),

    // Get single service by ID
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const service = await ctx.db.service.findFirst({
                where: {
                    id: input.id,
                    tenantId: ctx.tenantId!,
                },
            });

            if (!service) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Serviço não encontrado',
                });
            }

            return service;
        }),

    // Create new service
    create: managerProcedure
        .input(serviceCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const service = await ctx.db.service.create({
                data: {
                    ...input,
                    basePrice: input.basePrice,
                    tenantId: ctx.tenantId!,
                },
            });

            return service;
        }),

    // Update service
    update: managerProcedure
        .input(
            z.object({
                id: z.string(),
                data: serviceUpdateSchema,
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.service.findFirst({
                where: {
                    id: input.id,
                    tenantId: ctx.tenantId!,
                },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Serviço não encontrado',
                });
            }

            const service = await ctx.db.service.update({
                where: { id: input.id },
                data: input.data,
            });

            return service;
        }),

    // Toggle active status
    toggleActive: managerProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.service.findFirst({
                where: {
                    id: input.id,
                    tenantId: ctx.tenantId!,
                },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Serviço não encontrado',
                });
            }

            const service = await ctx.db.service.update({
                where: { id: input.id },
                data: { isActive: !existing.isActive },
            });

            return service;
        }),

    // Delete service (only if no orders use it)
    delete: managerProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.service.findFirst({
                where: {
                    id: input.id,
                    tenantId: ctx.tenantId!,
                },
                include: {
                    _count: { select: { orderItems: true } },
                },
            });

            if (!existing) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Serviço não encontrado',
                });
            }

            if (existing._count.orderItems > 0) {
                throw new TRPCError({
                    code: 'PRECONDITION_FAILED',
                    message: 'Serviço possui ordens vinculadas. Desative-o ao invés de excluir.',
                });
            }

            await ctx.db.service.delete({
                where: { id: input.id },
            });

            return { success: true };
        }),

    // List active services for selection
    listActive: protectedProcedure.query(async ({ ctx }) => {
        const services = await ctx.db.service.findMany({
            where: {
                tenantId: ctx.tenantId!,
                isActive: true,
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                basePrice: true,
                estimatedTime: true,
            },
        });

        return services;
    }),
});
