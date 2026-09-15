import { hasRedisConfigured } from '../../../../lib/redis/redis.service';

export const DEFAULT_AI_GENERATION_QUEUE_NAME = 'ai-generation';
export const DEFAULT_AI_WORKER_CONCURRENCY = 2;
export const DEFAULT_LOCK_DURATION_MS = 60_000;
export const DEFAULT_STALLED_INTERVAL_MS = 30_000;
export const DEFAULT_MAX_STALLED_COUNT = 1;

export function getAiGenerationQueueName(): string {
    return process.env.AI_GENERATION_QUEUE_NAME?.trim() || DEFAULT_AI_GENERATION_QUEUE_NAME;
}

export function getAiWorkerConcurrency(): number {
    const raw = process.env.AI_GENERATION_WORKER_CONCURRENCY?.trim();
    if (!raw) return DEFAULT_AI_WORKER_CONCURRENCY;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed <= 0 ? DEFAULT_AI_WORKER_CONCURRENCY : parsed;
}

export function shouldStartEmbeddedAiWorker(): boolean {
    return process.env.ENABLE_EMBEDDED_AI_WORKER?.trim().toLowerCase() === 'true';
}

export type QueueOperationalMode = 'redis' | 'in-memory';

export function resolveQueueOperationalMode(): QueueOperationalMode {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
        // Production strictly requires Redis
        return 'redis';
    }

    // In non-production, use Redis if configured, otherwise fallback to in-memory
    return hasRedisConfigured() ? 'redis' : 'in-memory';
}
