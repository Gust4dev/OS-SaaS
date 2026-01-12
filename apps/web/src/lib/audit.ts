import { prisma } from '@autevo/database';

interface AuditParams {
    tenantId: string;
    userId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    oldValue?: unknown;
    newValue?: unknown;
    ipAddress?: string | null;
    userAgent?: string | null;
}

export async function createAuditLog(params: AuditParams) {
    return prisma.auditLog.create({
        data: {
            tenantId: params.tenantId,
            userId: params.userId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            oldValue: params.oldValue as any,
            newValue: params.newValue as any,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        },
    });
}

export async function getAuditLogs(tenantId: string, limit = 50) {
    return prisma.auditLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: { select: { name: true, email: true } } },
    });
}
