import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as redisModule from '../../../../lib/redis/redis.service';
import {
    DEFAULT_AI_GENERATION_QUEUE_NAME,
    DEFAULT_AI_WORKER_CONCURRENCY,
    DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS,
    DEFAULT_LOCK_DURATION_MS,
    DEFAULT_MAX_STALLED_COUNT,
    DEFAULT_STALLED_INTERVAL_MS,
    getAiGenerationQueueName,
    getAiWorkerConcurrency,
    getAiWorkerDrainDelaySeconds,
    getAiWorkerStalledIntervalMs,
    resolveQueueOperationalMode,
    shouldStartEmbeddedAiWorker,
} from './ai-generation-queue.config';

describe('ai-generation-queue.config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.restoreAllMocks();
        process.env = { ...originalEnv };
        delete process.env.AI_GENERATION_QUEUE_NAME;
        delete process.env.AI_GENERATION_WORKER_CONCURRENCY;
        delete process.env.AI_GENERATION_WORKER_DRAIN_DELAY_SECONDS;
        delete process.env.AI_GENERATION_WORKER_STALLED_INTERVAL_MS;
        delete process.env.ENABLE_EMBEDDED_AI_WORKER;
        delete process.env.NODE_ENV;
    });

    it('returns default values when environment variables are unset', () => {
        expect(DEFAULT_AI_GENERATION_QUEUE_NAME).toBe('ai-generation');
        expect(getAiGenerationQueueName()).toBe('ai-generation');
        expect(DEFAULT_AI_WORKER_CONCURRENCY).toBe(2);
        expect(getAiWorkerConcurrency()).toBe(2);
        expect(DEFAULT_LOCK_DURATION_MS).toBe(60_000);
        expect(DEFAULT_STALLED_INTERVAL_MS).toBe(120_000);
        expect(getAiWorkerStalledIntervalMs()).toBe(120_000);
        expect(DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS).toBe(30);
        expect(getAiWorkerDrainDelaySeconds()).toBe(30);
        expect(DEFAULT_MAX_STALLED_COUNT).toBe(1);
    });

    it('parses valid environment variables when provided', () => {
        process.env.AI_GENERATION_QUEUE_NAME = 'custom-ai-queue';
        process.env.AI_GENERATION_WORKER_CONCURRENCY = '4';
        process.env.AI_GENERATION_WORKER_DRAIN_DELAY_SECONDS = '45';
        process.env.AI_GENERATION_WORKER_STALLED_INTERVAL_MS = '180000';

        expect(getAiGenerationQueueName()).toBe('custom-ai-queue');
        expect(getAiWorkerConcurrency()).toBe(4);
        expect(getAiWorkerDrainDelaySeconds()).toBe(45);
        expect(getAiWorkerStalledIntervalMs()).toBe(180_000);
    });

    it('falls back to safe defaults when environment variables are invalid or negative', () => {
        process.env.AI_GENERATION_WORKER_CONCURRENCY = 'invalid';
        process.env.AI_GENERATION_WORKER_DRAIN_DELAY_SECONDS = '-10';
        process.env.AI_GENERATION_WORKER_STALLED_INTERVAL_MS = '0';

        expect(getAiWorkerConcurrency()).toBe(DEFAULT_AI_WORKER_CONCURRENCY);
        expect(getAiWorkerDrainDelaySeconds()).toBe(DEFAULT_AI_WORKER_DRAIN_DELAY_SECONDS);
        expect(getAiWorkerStalledIntervalMs()).toBe(DEFAULT_STALLED_INTERVAL_MS);
    });

    it('starts embedded worker only when ENABLE_EMBEDDED_AI_WORKER is explicitly true', () => {
        expect(shouldStartEmbeddedAiWorker()).toBe(false);

        process.env.ENABLE_EMBEDDED_AI_WORKER = ' TRUE ';
        expect(shouldStartEmbeddedAiWorker()).toBe(true);

        process.env.ENABLE_EMBEDDED_AI_WORKER = 'false';
        expect(shouldStartEmbeddedAiWorker()).toBe(false);

        process.env.ENABLE_EMBEDDED_AI_WORKER = '1';
        expect(shouldStartEmbeddedAiWorker()).toBe(false);
    });

    it('resolves operational mode correctly based on NODE_ENV and Redis availability', () => {
        // Production always strictly requires Redis
        process.env.NODE_ENV = 'production';
        expect(resolveQueueOperationalMode()).toBe('redis');

        // Non-production with Redis configured
        process.env.NODE_ENV = 'development';
        vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(true);
        expect(resolveQueueOperationalMode()).toBe('redis');

        // Non-production without Redis configured falls back to in-memory
        vi.spyOn(redisModule, 'hasRedisConfigured').mockReturnValue(false);
        expect(resolveQueueOperationalMode()).toBe('in-memory');
    });
});
