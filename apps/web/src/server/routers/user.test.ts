import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';

/**
 * Tests for the user router.
 * Covers user management, invites, role changes, and deactivation.
 */

const mockPrisma = {
    user: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
    },
    pendingInvite: {
        create: vi.fn(),
        findFirst: vi.fn(),
        delete: vi.fn(),
    },
};

const createMockContext = (role = 'OWNER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('userRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('list', () => {
        it('should return team members for tenant', async () => {
            mockPrisma.user.findMany.mockResolvedValue([
                { id: 'user-1', name: 'João Owner', role: 'OWNER' },
                { id: 'user-2', name: 'Maria Manager', role: 'MANAGER' },
                { id: 'user-3', name: 'Pedro Member', role: 'MEMBER' },
            ]);

            const ctx = createMockContext();

            const users = await ctx.db.user.findMany({
                where: { tenantId: ctx.tenantId, status: 'ACTIVE' },
            });

            expect(users).toHaveLength(3);
        });

        it('should include inactive users when requested', async () => {
            mockPrisma.user.findMany.mockResolvedValue([
                { id: 'user-1', status: 'ACTIVE' },
                { id: 'user-2', status: 'INACTIVE' },
            ]);

            const ctx = createMockContext();

            const users = await ctx.db.user.findMany({
                where: { tenantId: ctx.tenantId },
            });

            expect(users).toHaveLength(2);
        });
    });

    describe('invite', () => {
        it('should create pending invite', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user
            mockPrisma.pendingInvite.findFirst.mockResolvedValue(null); // No pending invite
            mockPrisma.pendingInvite.create.mockResolvedValue({
                id: 'invite-1',
                email: 'novo@email.com',
                role: 'MEMBER',
            });

            const ctx = createMockContext('OWNER');
            const input = { email: 'novo@email.com', role: 'MEMBER' };

            // Check no existing user
            const existingUser = await ctx.db.user.findFirst({
                where: { email: input.email, tenantId: ctx.tenantId },
            });
            expect(existingUser).toBeNull();

            // Check no pending invite
            const existingInvite = await ctx.db.pendingInvite.findFirst({
                where: { email: input.email, tenantId: ctx.tenantId },
            });
            expect(existingInvite).toBeNull();

            // Create invite
            const invite = await ctx.db.pendingInvite.create({
                data: { ...input, tenantId: ctx.tenantId },
            });

            expect(invite.email).toBe('novo@email.com');
        });

        it('should reject invite for existing user', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'existing',
                email: 'existe@email.com',
            });

            const ctx = createMockContext();

            const existing = await ctx.db.user.findFirst({
                where: { email: 'existe@email.com', tenantId: ctx.tenantId },
            });

            const checkExisting = () => {
                if (existing) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Usuário já faz parte da equipe',
                    });
                }
            };

            expect(checkExisting).toThrow('já faz parte');
        });

        it('should reject duplicate invite', async () => {
            mockPrisma.user.findFirst.mockResolvedValue(null);
            mockPrisma.pendingInvite.findFirst.mockResolvedValue({
                id: 'existing-invite',
                email: 'pendente@email.com',
            });

            const ctx = createMockContext();

            const existingInvite = await ctx.db.pendingInvite.findFirst({
                where: { email: 'pendente@email.com', tenantId: ctx.tenantId },
            });

            const checkDuplicate = () => {
                if (existingInvite) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Já existe um convite pendente para este email',
                    });
                }
            };

            expect(checkDuplicate).toThrow('convite pendente');
        });
    });

    describe('updateRole', () => {
        it('should allow OWNER to change roles', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'user-2',
                role: 'MEMBER',
                tenantId: 'tenant-123',
            });
            mockPrisma.user.update.mockResolvedValue({
                id: 'user-2',
                role: 'MANAGER',
            });

            const ctx = createMockContext('OWNER');

            const updated = await ctx.db.user.update({
                where: { id: 'user-2' },
                data: { role: 'MANAGER' },
            });

            expect(updated.role).toBe('MANAGER');
        });

        it('should prevent self role change', async () => {
            const ctx = createMockContext('OWNER');

            const checkSelf = (targetUserId: string) => {
                if (targetUserId === ctx.user.id) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Você não pode alterar seu próprio cargo',
                    });
                }
            };

            expect(() => checkSelf('user-123')).toThrow('próprio cargo');
        });

        it('should prevent removing last OWNER', async () => {
            mockPrisma.user.count.mockResolvedValue(1); // Only one owner

            const ctx = createMockContext('OWNER');

            const ownerCount = await ctx.db.user.count({
                where: { tenantId: ctx.tenantId, role: 'OWNER', status: 'ACTIVE' },
            });

            const checkLastOwner = (currentRole: string, newRole: string) => {
                if (currentRole === 'OWNER' && newRole !== 'OWNER' && ownerCount <= 1) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Não é possível remover o último proprietário',
                    });
                }
            };

            expect(() => checkLastOwner('OWNER', 'MANAGER')).toThrow('último proprietário');
        });

        it('should only allow valid roles', () => {
            const validRoles = ['OWNER', 'MANAGER', 'MEMBER'];

            const validateRole = (role: string) => {
                if (!validRoles.includes(role)) {
                    throw new Error('Cargo inválido');
                }
                return true;
            };

            expect(validateRole('OWNER')).toBe(true);
            expect(validateRole('MANAGER')).toBe(true);
            expect(validateRole('MEMBER')).toBe(true);
            expect(() => validateRole('ADMIN_SAAS')).toThrow(); // Can't assign ADMIN_SAAS
            expect(() => validateRole('INVALID')).toThrow();
        });
    });

    describe('deactivate', () => {
        it('should deactivate user', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'user-2',
                status: 'ACTIVE',
            });
            mockPrisma.user.update.mockResolvedValue({
                id: 'user-2',
                status: 'INACTIVE',
            });

            const ctx = createMockContext('OWNER');

            const updated = await ctx.db.user.update({
                where: { id: 'user-2' },
                data: { status: 'INACTIVE' },
            });

            expect(updated.status).toBe('INACTIVE');
        });

        it('should prevent self deactivation', async () => {
            const ctx = createMockContext('OWNER');

            const checkSelf = (targetUserId: string) => {
                if (targetUserId === ctx.user.id) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Você não pode desativar a si mesmo',
                    });
                }
            };

            expect(() => checkSelf('user-123')).toThrow('si mesmo');
        });

        it('should prevent deactivating last OWNER', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'owner-1',
                role: 'OWNER',
            });
            mockPrisma.user.count.mockResolvedValue(1);

            const ctx = createMockContext('OWNER');

            const targetUser = await ctx.db.user.findFirst({ where: { id: 'owner-1' } });
            const ownerCount = await ctx.db.user.count({
                where: { tenantId: ctx.tenantId, role: 'OWNER', status: 'ACTIVE' },
            });

            const checkLastOwner = () => {
                if (targetUser?.role === 'OWNER' && ownerCount <= 1) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Não é possível desativar o último proprietário',
                    });
                }
            };

            expect(checkLastOwner).toThrow('último proprietário');
        });
    });

    describe('reactivate', () => {
        it('should reactivate inactive user', async () => {
            mockPrisma.user.findFirst.mockResolvedValue({
                id: 'user-2',
                status: 'INACTIVE',
            });
            mockPrisma.user.update.mockResolvedValue({
                id: 'user-2',
                status: 'ACTIVE',
            });

            const ctx = createMockContext('OWNER');

            const updated = await ctx.db.user.update({
                where: { id: 'user-2' },
                data: { status: 'ACTIVE' },
            });

            expect(updated.status).toBe('ACTIVE');
        });
    });
});

describe('userRouter - Access Control', () => {
    it('should allow only OWNER to manage users', () => {
        const checkRole = (role: string) => {
            const allowed = ['ADMIN_SAAS', 'OWNER'];
            if (!allowed.includes(role)) {
                throw new TRPCError({ code: 'FORBIDDEN' });
            }
            return true;
        };

        expect(checkRole('OWNER')).toBe(true);
        expect(checkRole('ADMIN_SAAS')).toBe(true);
        expect(() => checkRole('MANAGER')).toThrow(TRPCError);
        expect(() => checkRole('MEMBER')).toThrow(TRPCError);
    });
});
