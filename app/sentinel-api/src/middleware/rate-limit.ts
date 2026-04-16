import { RateLimitService, RateLimitOptions } from '../lib/rate-limit/rate-limit.service';
import { getRedisClient } from '../lib/redis/redis-client';
import { HTTPException } from 'hono/http-exception';
import type { MiddlewareHandler } from 'hono';

/**
 * Creates a Hono middleware for rate limiting.
 * @param options Rate limiting options (limit, windowSeconds, prefix)
 */
export const createRateLimitMiddleware = (options: RateLimitOptions): MiddlewareHandler => {
    const redis = getRedisClient();

    // If Redis is not configured, we allow the request to proceed.
    // In a production environment, REDIS_URL should be mandatory for security.
    if (!redis) {
        return async (_c, next) => {
            await next();
        };
    }

    const service = new RateLimitService(redis);

    return async (c, next) => {
        // Extract IP from headers. Hono's c.req.header is used.
        const ip =
            c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
            c.req.header('x-real-ip') ||
            '127.0.0.1';

        // Use IP as the key. The service adds the prefix.
        const result = await service.check(ip, options);

        // Set standard rate limit headers
        c.header('X-RateLimit-Limit', String(result.limit));
        c.header('X-RateLimit-Remaining', String(result.remaining));
        c.header('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));

        if (!result.success) {
            const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
            c.header('Retry-After', String(retryAfter));

            throw new HTTPException(429, {
                message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            });
        }

        await next();
    };
};
