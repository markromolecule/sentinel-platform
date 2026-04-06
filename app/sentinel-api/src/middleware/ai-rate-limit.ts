import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { HonoEnv } from '../types/hono';

const AI_REQUEST_WINDOW_MS = 60_000;
const AI_REQUEST_LIMIT = 5;
const AI_MAX_CONCURRENT_REQUESTS = 1;
const AI_STORE_TTL_MS = 15 * 60_000;

type RateLimitState = {
    requestTimestamps: number[];
    activeRequests: number;
    lastSeenAt: number;
};

const aiRateLimitStore = new Map<string, RateLimitState>();

function pruneStore(now: number) {
    for (const [key, value] of aiRateLimitStore.entries()) {
        if (
            value.activeRequests === 0 &&
            value.requestTimestamps.length === 0 &&
            now - value.lastSeenAt > AI_STORE_TTL_MS
        ) {
            aiRateLimitStore.delete(key);
        }
    }
}

export const aiRateLimitMiddleware: MiddlewareHandler<HonoEnv> = async (c, next) => {
    const user = c.get('user');
    const key = user?.id || c.req.header('x-forwarded-for') || 'anonymous-ai-user';
    const now = Date.now();

    pruneStore(now);

    const currentState = aiRateLimitStore.get(key) ?? {
        requestTimestamps: [],
        activeRequests: 0,
        lastSeenAt: now,
    };

    currentState.requestTimestamps = currentState.requestTimestamps.filter(
        (timestamp) => now - timestamp < AI_REQUEST_WINDOW_MS,
    );
    currentState.lastSeenAt = now;

    const oldestTimestamp = currentState.requestTimestamps[0];

    if (currentState.requestTimestamps.length >= AI_REQUEST_LIMIT) {
        const retryAfterSeconds = oldestTimestamp
            ? Math.max(1, Math.ceil((AI_REQUEST_WINDOW_MS - (now - oldestTimestamp)) / 1000))
            : 60;

        c.header('Retry-After', String(retryAfterSeconds));
        throw new HTTPException(429, {
            message: `Too many AI preview requests. Please try again in about ${retryAfterSeconds} seconds.`,
        });
    }

    if (currentState.activeRequests >= AI_MAX_CONCURRENT_REQUESTS) {
        throw new HTTPException(429, {
            message: 'An AI preview request is already running for this user. Please wait for it to finish.',
        });
    }

    currentState.requestTimestamps.push(now);
    currentState.activeRequests += 1;
    aiRateLimitStore.set(key, currentState);

    c.header('X-AI-RateLimit-Limit', String(AI_REQUEST_LIMIT));
    c.header(
        'X-AI-RateLimit-Remaining',
        String(Math.max(0, AI_REQUEST_LIMIT - currentState.requestTimestamps.length)),
    );

    try {
        await next();
    } finally {
        const nextState = aiRateLimitStore.get(key);
        if (!nextState) {
            return;
        }

        nextState.activeRequests = Math.max(0, nextState.activeRequests - 1);
        nextState.requestTimestamps = nextState.requestTimestamps.filter(
            (timestamp) => Date.now() - timestamp < AI_REQUEST_WINDOW_MS,
        );
        nextState.lastSeenAt = Date.now();
        aiRateLimitStore.set(key, nextState);
    }
};
