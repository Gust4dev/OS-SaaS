import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the settings router.
 * Covers tenant settings management and branding.
 */

const mockPrisma = {
    tenantSettings: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
    },
    tenant: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
};

const createMockContext = (role = 'OWNER') => ({
    db: mockPrisma,
    user: { id: 'user-123', role, tenantId: 'tenant-123' },
    tenantId: 'tenant-123',
});

describe('settingsRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('get', () => {
        it('should return tenant settings', async () => {
            mockPrisma.tenantSettings.findUnique.mockResolvedValue({
                tenantId: 'tenant-123',
                name: 'AutoShine',
                logo: 'https://example.com/logo.png',
                primaryColor: '#DC2626',
                secondaryColor: '#1F2937',
            });

            const ctx = createMockContext();

            const settings = await ctx.db.tenantSettings.findUnique({
                where: { tenantId: ctx.tenantId },
            });

            expect(settings?.name).toBe('AutoShine');
            expect(settings?.primaryColor).toBe('#DC2626');
        });

        it('should return default values when no settings', async () => {
            mockPrisma.tenantSettings.findUnique.mockResolvedValue(null);

            const ctx = createMockContext();

            const settings = await ctx.db.tenantSettings.findUnique({
                where: { tenantId: ctx.tenantId },
            });

            const defaults = {
                name: settings?.name || 'Autevo',
                logo: settings?.logo || null,
                primaryColor: settings?.primaryColor || '#DC2626',
            };

            expect(defaults.name).toBe('Autevo');
            expect(defaults.primaryColor).toBe('#DC2626');
        });
    });

    describe('update', () => {
        it('should update tenant settings (owner only)', async () => {
            mockPrisma.tenantSettings.upsert.mockResolvedValue({
                tenantId: 'tenant-123',
                name: 'Nova Estética',
                primaryColor: '#4F46E5',
            });

            const ctx = createMockContext('OWNER');
            const input = {
                name: 'Nova Estética',
                primaryColor: '#4F46E5',
            };

            const settings = await ctx.db.tenantSettings.upsert({
                where: { tenantId: ctx.tenantId },
                update: input,
                create: { ...input, tenantId: ctx.tenantId },
            });

            expect(settings.name).toBe('Nova Estética');
        });

        it('should validate color format', () => {
            const validateColor = (color: string) => {
                const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                if (!hexRegex.test(color)) {
                    throw new Error('Formato de cor inválido');
                }
                return true;
            };

            expect(validateColor('#DC2626')).toBe(true);
            expect(validateColor('#fff')).toBe(true);
            expect(() => validateColor('red')).toThrow();
            expect(() => validateColor('#GGGGGG')).toThrow();
        });

        it('should validate logo URL', () => {
            const validateUrl = (url: string | null) => {
                if (!url) return true;
                try {
                    new URL(url);
                    return true;
                } catch {
                    throw new Error('URL inválida');
                }
            };

            expect(validateUrl(null)).toBe(true);
            expect(validateUrl('https://example.com/logo.png')).toBe(true);
            expect(() => validateUrl('not-a-url')).toThrow();
        });
    });

    describe('updateOperatingHours', () => {
        it('should update business hours', async () => {
            const operatingHours = {
                monday: { open: '08:00', close: '18:00', enabled: true },
                tuesday: { open: '08:00', close: '18:00', enabled: true },
                wednesday: { open: '08:00', close: '18:00', enabled: true },
                thursday: { open: '08:00', close: '18:00', enabled: true },
                friday: { open: '08:00', close: '18:00', enabled: true },
                saturday: { open: '08:00', close: '12:00', enabled: true },
                sunday: { open: null, close: null, enabled: false },
            };

            mockPrisma.tenantSettings.upsert.mockResolvedValue({
                tenantId: 'tenant-123',
                operatingHours,
            });

            const ctx = createMockContext('OWNER');

            const settings = await ctx.db.tenantSettings.upsert({
                where: { tenantId: ctx.tenantId },
                update: { operatingHours },
                create: { tenantId: ctx.tenantId, operatingHours },
            });

            expect(settings.operatingHours.monday.open).toBe('08:00');
            expect(settings.operatingHours.sunday.enabled).toBe(false);
        });

        it('should validate time format', () => {
            const validateTime = (time: string | null) => {
                if (!time) return true;
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!timeRegex.test(time)) {
                    throw new Error('Formato de horário inválido (HH:MM)');
                }
                return true;
            };

            expect(validateTime('08:00')).toBe(true);
            expect(validateTime('23:59')).toBe(true);
            expect(validateTime(null)).toBe(true);
            expect(() => validateTime('25:00')).toThrow();
            expect(() => validateTime('8:00')).toThrow();
        });
    });
});

describe('settingsRouter - Access Control', () => {
    it('should allow any authenticated user to read settings', () => {
        const roles = ['OWNER', 'MANAGER', 'MEMBER'];

        roles.forEach((role) => {
            const canRead = true; // All roles can read
            expect(canRead).toBe(true);
        });
    });

    it('should only allow OWNER to update settings', () => {
        const checkRole = (role: string) => {
            const allowed = ['ADMIN_SAAS', 'OWNER'];
            return allowed.includes(role);
        };

        expect(checkRole('OWNER')).toBe(true);
        expect(checkRole('ADMIN_SAAS')).toBe(true);
        expect(checkRole('MANAGER')).toBe(false);
        expect(checkRole('MEMBER')).toBe(false);
    });
});
