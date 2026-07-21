import { beforeEach, describe, expect, it } from 'vitest';
import {
    getPdfJobOptions,
    getPdfGenerationMode,
    shouldStartEmbeddedPdfWorker,
    getPdfQueueName,
    getPdfWorkerConcurrency,
    getPdfWorkerDrainDelaySeconds,
    getPdfWorkerStalledIntervalMs,
    PDF_QUEUE_NAME,
    DEFAULT_PDF_QUEUE_NAME,
    DEFAULT_PDF_WORKER_CONCURRENCY,
    DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS,
    DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS,
} from './pdf-generation-queue.config';

describe('pdf-generation-queue.config', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.PDF_GENERATION_QUEUE_NAME;
        delete process.env.PDF_GENERATION_MODE;
        delete process.env.ENABLE_EMBEDDED_PDF_WORKER;
        delete process.env.PDF_WORKER_CONCURRENCY;
        delete process.env.PDF_WORKER_DRAIN_DELAY_SECONDS;
        delete process.env.PDF_WORKER_STALLED_INTERVAL_MS;
    });

    it('defaults to direct processing even in production', () => {
        process.env.NODE_ENV = 'production';

        expect(getPdfGenerationMode()).toBe('sync');
    });

    it('uses Redis processing only when explicitly configured', () => {
        process.env.PDF_GENERATION_MODE = 'redis';

        expect(getPdfGenerationMode()).toBe('redis');
    });

    it('starts an embedded worker only when explicitly enabled', () => {
        expect(shouldStartEmbeddedPdfWorker()).toBe(false);

        process.env.ENABLE_EMBEDDED_PDF_WORKER = ' TRUE ';
        expect(shouldStartEmbeddedPdfWorker()).toBe(true);

        process.env.ENABLE_EMBEDDED_PDF_WORKER = 'false';
        expect(shouldStartEmbeddedPdfWorker()).toBe(false);
    });

    it('uses default values when environment variables are unset', () => {
        expect(PDF_QUEUE_NAME).toBe('pdf-generation');
        expect(getPdfQueueName()).toBe(DEFAULT_PDF_QUEUE_NAME);
        expect(getPdfWorkerConcurrency()).toBe(DEFAULT_PDF_WORKER_CONCURRENCY);
        expect(getPdfWorkerDrainDelaySeconds()).toBe(DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS);
        expect(getPdfWorkerStalledIntervalMs()).toBe(DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS);
    });

    it('parses valid environment variables when provided', () => {
        process.env.PDF_GENERATION_QUEUE_NAME = 'custom-pdf-queue';
        process.env.PDF_WORKER_CONCURRENCY = '5';
        process.env.PDF_WORKER_DRAIN_DELAY_SECONDS = '60';
        process.env.PDF_WORKER_STALLED_INTERVAL_MS = '600000';

        expect(getPdfQueueName()).toBe('custom-pdf-queue');
        expect(getPdfWorkerConcurrency()).toBe(5);
        expect(getPdfWorkerDrainDelaySeconds()).toBe(60);
        expect(getPdfWorkerStalledIntervalMs()).toBe(600000);
    });

    it('falls back to safe defaults when environment variables are invalid or negative', () => {
        process.env.PDF_WORKER_CONCURRENCY = 'invalid';
        process.env.PDF_WORKER_DRAIN_DELAY_SECONDS = '-10';
        process.env.PDF_WORKER_STALLED_INTERVAL_MS = '0';

        expect(getPdfWorkerConcurrency()).toBe(DEFAULT_PDF_WORKER_CONCURRENCY);
        expect(getPdfWorkerDrainDelaySeconds()).toBe(DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS);
        expect(getPdfWorkerStalledIntervalMs()).toBe(DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS);
    });

    it('returns retry and cleanup defaults for PDF jobs', () => {
        const options = getPdfJobOptions();

        expect(options.attempts).toBe(3);
        expect(options.backoff).toEqual({
            type: 'exponential',
            delay: 5000,
        });
        expect(options.removeOnComplete).toEqual({
            age: 24 * 3600,
            count: 100,
        });
        expect(options.removeOnFail).toEqual({
            age: 7 * 24 * 3600,
            count: 500,
        });
    });
});
