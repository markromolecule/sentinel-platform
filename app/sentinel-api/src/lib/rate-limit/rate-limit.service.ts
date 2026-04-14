import type IORedis from 'ioredis';

export interface RateLimitOptions {
    limit: number;
    windowSeconds: number;
    prefix?: string;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Reusable Rate Limiter using Redis.
 * Implements Fixed Window algorithm for tiny memory footprint.
 */
export class RateLimitService {
    private redis: IORedis;
    private defaultPrefix: string;

    constructor(redis: IORedis, defaultPrefix = 'rl') {
        this.redis = redis;
        this.defaultPrefix = defaultPrefix;
    }

    /**
     * Checks if a key has exceeded the rate limit.
     * Uses INCR and EXPIRE for maximum efficiency.
     */
    async check(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
        const { limit, windowSeconds, prefix = this.defaultPrefix } = options;
        const fullKey = `${prefix}:${key}`;
        const defaultReset = Date.now() + windowSeconds * 1000;

        try {
            // 1. Increment the counter
            const current = await this.redis.incr(fullKey);

            // 2. Set TTL on first request in the window
            if (current === 1) {
                await this.redis.expire(fullKey, windowSeconds);
            }

            // 3. Get TTL to inform the client when they can retry
            const ttl = await this.redis.ttl(fullKey);
            if (ttl === -1) {
                await this.redis.expire(fullKey, windowSeconds);
            }

            const remaining = Math.max(0, limit - current);
            const success = current <= limit;
            const reset = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

            // Log the check for visibility
            console.log(
                `[RateLimit] ${prefix}:${key} - ${current}/${limit} (Remaining: ${remaining})`,
            );

            return {
                success,
                limit,
                remaining,
                reset,
            };
        } catch (error) {
            // FAIL-OPEN: If Redis fails, we allow the request to proceed to ensure auth isn't broken
            console.error('RateLimitService Error (Failing Open):', error);
            return {
                success: true,
                limit,
                remaining: limit,
                reset: defaultReset,
            };
        }
    }
}
