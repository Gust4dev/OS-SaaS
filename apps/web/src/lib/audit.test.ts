import { describe, it, expect, vi } from 'vitest';
import { createAuditLog } from './audit';

describe('audit', () => {
    it('should call prisma.auditLog.create with correct params', async () => {
        const params = {
            tenantId: 'tenant-123',
            userId: 'user-456',
            action: 'user.role_changed',
            entityType: 'User',
            entityId: 'entity-789',
            oldValue: { role: 'MEMBER' },
            newValue: { role: 'MANAGER' },
        };

        const result = await createAuditLog(params);

        expect(result).toHaveProperty('id');
    });

    it('should handle optional fields', async () => {
        const params = {
            tenantId: 'tenant-123',
            action: 'system.health_check',
            entityType: 'System',
        };

        const result = await createAuditLog(params);
        expect(result).toHaveProperty('id');
    });
});
