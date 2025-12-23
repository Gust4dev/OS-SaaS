import { router, protectedProcedure, ownerProcedure } from '../trpc';
import { z } from 'zod';

const setupSchema = z.object({
    // User Details
    jobTitle: z.string().min(2, 'Informe seu cargo'),

    // Branding
    tenantName: z.string().min(2, 'Informe o nome da empresa'),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
    logo: z.string().optional().nullable(),

    // Contact info
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export const tenantRouter = router({
    updateSetup: ownerProcedure
        .input(setupSchema)
        .mutation(async ({ ctx, input }) => {
            // Transaction to update both User and Tenant
            await ctx.db.$transaction(async (tx) => {
                // 1. Update User Job Title
                await tx.user.update({
                    where: { id: ctx.user!.id },
                    data: {
                        jobTitle: input.jobTitle,
                    },
                });

                // 2. Update Tenant Details
                await tx.tenant.update({
                    where: { id: ctx.user!.tenantId! },
                    data: {
                        name: input.tenantName,
                        primaryColor: input.primaryColor,
                        logo: input.logo,
                        email: input.email || null, // Handle empty string as null
                        phone: input.phone,
                        address: input.address,
                    },
                });
            });

            return { success: true };
        }),
});
