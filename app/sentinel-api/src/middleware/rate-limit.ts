import { RateLimitService, RateLimitOptions } from '../lib/rate-limit/rate-limit.service';
import { getRedisClient } from '../lib/redis/redis-client';
import { HTTPException } from 'hono/http-exception';
import type { Context, MiddlewareHandler } from 'hono';

interface EnhancedRateLimitOptions extends RateLimitOptions {
    // Allows dynamic key generation based on the request context (e.g., User ID + IP)
    keyGenerator?: (c: Context) => string | Promise<string>;
    // Choose whether to allow requests through if Redis fails ('open') or block them ('closed')
    failStrategy?: 'open' | 'closed';
}

export const createRateLimitMiddleware = (options: EnhancedRateLimitOptions): MiddlewareHandler => {
    const redis = getRedisClient();
    const failStrategy = options.failStrategy ?? 'open';

    // Startup Guard: Pass through if Redis isn't configured initially
    if (!redis) {
        return async (_c, next) => await next();
    }

    const service = new RateLimitService(redis);

    // Default identification strategy (User ID if authenticated, fallback to IP)
    const defaultKeyGenerator = (c: Context): string => {
        const user = c.get('user');
        if (user?.id) return `user:${user.id}`;

        return (
            c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
            c.req.header('x-real-ip') ||
            '127.0.0.1'
        );
    };

    return async (c, next) => {
        const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;
        const rateLimitKey = await keyGenerator(c);

        try {
            // Execute rate limit check against Redis
            const result = await service.check(rateLimitKey, options);

            // Populate rate limit status headers
            c.header('X-RateLimit-Limit', String(result.limit));
            c.header('X-RateLimit-Remaining', String(result.remaining));
            c.header('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));

            if (!result.success) {
                // Prevent negative or zero retry durations due to clock drift
                const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
                c.header('Retry-After', String(retryAfter));

                throw new HTTPException(429, {
                    message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                });
            }

            await next();
        } catch (error) {
            // If it's a known 429 HTTP exception, rethrow it
            if (error instanceof HTTPException && error.status === 429) {
                throw error;
            }

            // Runtime Resiliency: Handle Redis connection drops gracefully
            console.error('Rate limiting service failure:', error);

            if (failStrategy === 'closed') {
                throw new HTTPException(503, {
                    message: 'Service temporarily unavailable. Please try again later.',
                });
            }

            // Fail-open: Let the request pass so a Redis issue doesn't take down your app
            await next();
        }
    };
};
