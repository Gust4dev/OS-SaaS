import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock classes before importing
class MockRedis { }

class MockRatelimit {
    limit = vi.fn().mockResolvedValue({
        success: true,
        limit: 20,
        remaining: 19,
        reset: Date.now() + 60000,
    });
    static slidingWindow = vi.fn().mockReturnValue({});
}

vi.mock('@upstash/redis', () => ({ Redis: MockRedis }));
vi.mock('@upstash/ratelimit', () => ({ Ratelimit: MockRatelimit }));

describe('rate-limit', () => {
    it('should export checkRateLimit function', async () => {
        const { checkRateLimit } = await import('./rate-limit');
        expect(checkRateLimit).toBeDefined();
        expect(typeof checkRateLimit).toBe('function');
    });

    it('should return rate limit info', async () => {
        const { checkRateLimit } = await import('./rate-limit');
        const result = await checkRateLimit('user:123');

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('remaining');
        expect(result).toHaveProperty('resetAt');
    });
});
