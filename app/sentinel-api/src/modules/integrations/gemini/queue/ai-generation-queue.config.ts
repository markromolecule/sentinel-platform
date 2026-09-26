import { hasRedisConfigured } from '../../../../lib/redis/redis.service';

export const DEFAULT_AI_GENERATION_QUEUE_NAME = 'ai-generation';
export const DEFAULT_AI_WORKER_CONCURRENCY = 2;
export const DEFAULT_LOCK_DURATION_MS = 60_000;
/**
 * Conservative stalled interval of 2 minutes to minimize idle Redis polling commands.
 * Active jobs automatically renew locks every 30s (half of lockDuration).
 */
export const DEFAULT_STALLED_INTERVAL_MS = 120_000;
/**
 * Number of seconds to long poll when the queue is empty before issuing the next BRPOPLPUSH / polling command.
 * Default in BullMQ is 5s; 30s reduces idle command consumption by ~83%.
 */
export const DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS = 30;
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

export function getAiWorkerDrainDelaySeconds(): number {
    const raw = process.env.AI_GENERATION_WORKER_DRAIN_DELAY_SECONDS?.trim();
    if (!raw) return DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed <= 0 ? DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS : parsed;
}

export function getAiWorkerStalledIntervalMs(): number {
    const raw = process.env.AI_GENERATION_WORKER_STALLED_INTERVAL_MS?.trim();
    if (!raw) return DEFAULT_STALLED_INTERVAL_MS;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) || parsed <= 0 ? DEFAULT_STALLED_INTERVAL_MS : parsed;
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
