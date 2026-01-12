import { vi } from 'vitest';

// Mock environment variables for tests
process.env.ENCRYPTION_KEY = 'test-key-32-bytes-long-for-tests';
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

// Mock Prisma
vi.mock('@autevo/database', () => ({
    prisma: {
        auditLog: {
            create: vi.fn().mockResolvedValue({ id: 'test-id' }),
            findMany: vi.fn().mockResolvedValue([]),
        },
        user: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
        },
        tenant: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));
