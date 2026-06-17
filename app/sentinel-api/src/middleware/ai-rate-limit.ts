import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HonoEnv } from '../types/hono';

// 1. Centralized Configuration
const LIMIT_CONFIG = {
    WINDOW_MS: 60_000,
    MAX_REQUESTS: 5,
    MAX_CONCURRENT: 1,
    STORE_TTL_MS: 15 * 60_000,
} as const;

type RateLimitState = {
    requestTimestamps: number[];
    activeRequests: number;
    lastSeenAt: number;
};

const aiRateLimitStore = new Map<string, RateLimitState>();

// 2. Fixed Bottleneck: Move cleanup to a background interval
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of aiRateLimitStore.entries()) {
        if (value.activeRequests === 0 && now - value.lastSeenAt > LIMIT_CONFIG.STORE_TTL_MS) {
            aiRateLimitStore.delete(key);
        }
    }
}, LIMIT_CONFIG.STORE_TTL_MS);

export const aiRateLimitMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
    // 3. Clean Identifier Resolution
    const user = c.get('user');
    const key = user?.id || c.req.header('x-forwarded-for') || 'anonymous-ai-user';
    const now = Date.now();

    // 4. Lazy-load and clean up timestamps *only* for the current user context
    const state = aiRateLimitStore.get(key) ?? {
        requestTimestamps: [],
        activeRequests: 0,
        lastSeenAt: now,
    };

    state.requestTimestamps = state.requestTimestamps.filter(
        (t) => now - t < LIMIT_CONFIG.WINDOW_MS,
    );
    state.lastSeenAt = now;

    // 5. Fail Fast: Guard Clauses
    if (state.activeRequests >= LIMIT_CONFIG.MAX_CONCURRENT) {
        throw new HTTPException(429, {
            message:
                'An AI preview request is already running for this user. Please wait for it to finish.',
        });
    }

    if (state.requestTimestamps.length >= LIMIT_CONFIG.MAX_REQUESTS) {
        const oldestTimestamp = state.requestTimestamps[0];
        const retryAfterSeconds = oldestTimestamp
            ? Math.max(1, Math.ceil((LIMIT_CONFIG.WINDOW_MS - (now - oldestTimestamp)) / 1000))
            : 60;

        c.header('Retry-After', String(retryAfterSeconds));
        throw new HTTPException(429, {
            message: `Too many AI preview requests. Please try again in about ${retryAfterSeconds} seconds.`,
        });
    }

    // 6. Commit State Pre-Flight
    state.requestTimestamps.push(now);
    state.activeRequests += 1;
    aiRateLimitStore.set(key, state);

    // 7. Standardize Headers
    c.header('X-AI-RateLimit-Limit', String(LIMIT_CONFIG.MAX_REQUESTS));
    c.header(
        'X-AI-RateLimit-Remaining',
        String(Math.max(0, LIMIT_CONFIG.MAX_REQUESTS - state.requestTimestamps.length)),
    );

    try {
        await next();
    } finally {
        // 8. Safely release concurrency locks
        const freshState = aiRateLimitStore.get(key);
        if (freshState) {
            freshState.activeRequests = Math.max(0, freshState.activeRequests - 1);
            freshState.lastSeenAt = Date.now();
            aiRateLimitStore.set(key, freshState);
        }
    }
};
