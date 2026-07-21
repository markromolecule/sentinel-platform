import { JobsOptions } from 'bullmq';

export const DEFAULT_PDF_QUEUE_NAME = 'pdf-generation';

/**
 * Resolves the target PDF queue name.
 */
export function getPdfQueueName(): string {
    const queueName = process.env.PDF_GENERATION_QUEUE_NAME?.trim();
    return queueName || DEFAULT_PDF_QUEUE_NAME;
}

export const PDF_QUEUE_NAME = DEFAULT_PDF_QUEUE_NAME;

export type PdfGenerationMode = 'sync' | 'redis';

/**
 * Resolves the effective PDF generation mode.
 * Defaults to direct, in-process generation in every environment. Redis-backed
 * processing must be explicitly enabled.
 */
export function getPdfGenerationMode(): PdfGenerationMode {
    const configuredMode = process.env.PDF_GENERATION_MODE?.trim().toLowerCase();

    if (configuredMode === 'redis') {
        return 'redis';
    }

    if (configuredMode === 'sync') {
        return 'sync';
    }

    return 'sync';
}

/**
 * Embedded workers are opt-in so API replicas never create idle BullMQ pollers
 * merely because the API process started.
 */
export function shouldStartEmbeddedPdfWorker(): boolean {
    return process.env.ENABLE_EMBEDDED_PDF_WORKER?.trim().toLowerCase() === 'true';
}

export const DEFAULT_PDF_WORKER_CONCURRENCY = 2;

/**
 * Resolves worker concurrency setting.
 */
export function getPdfWorkerConcurrency(): number {
    const raw = process.env.PDF_WORKER_CONCURRENCY?.trim();
    if (!raw) return DEFAULT_PDF_WORKER_CONCURRENCY;

    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed <= 0) {
        return DEFAULT_PDF_WORKER_CONCURRENCY;
    }
    return parsed;
}

export const DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS = 120;

/**
 * Resolves worker long-poll drain delay in seconds.
 */
export function getPdfWorkerDrainDelaySeconds(): number {
    const raw = process.env.PDF_WORKER_DRAIN_DELAY_SECONDS?.trim();
    if (!raw) return DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS;

    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed <= 0) {
        return DEFAULT_PDF_WORKER_DRAIN_DELAY_SECONDS;
    }
    return parsed;
}

export const DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS = 300000;

/**
 * Resolves worker stalled-job check interval in milliseconds.
 */
export function getPdfWorkerStalledIntervalMs(): number {
    const raw = process.env.PDF_WORKER_STALLED_INTERVAL_MS?.trim();
    if (!raw) return DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS;

    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed <= 0) {
        return DEFAULT_PDF_WORKER_STALLED_INTERVAL_MS;
    }
    return parsed;
}

/**
 * Returns default configuration settings for PDF generation background jobs.
 * Enforces attempts, backoff, and size-capped cleanup.
 */
export function getPdfJobOptions(): JobsOptions {
    return {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000, // 5 seconds initial delay
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 100, // Keep at most 100 completed jobs
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
            count: 500, // Keep at most 500 failed jobs
        },
    };
}
