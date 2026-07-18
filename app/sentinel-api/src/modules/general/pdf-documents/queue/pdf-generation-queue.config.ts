import { JobsOptions } from 'bullmq';

export const PDF_QUEUE_NAME = 'pdf-generation';

export type PdfGenerationMode = 'sync' | 'redis';

/**
 * Resolves the effective PDF generation mode.
 * Defaults to 'sync' in development/test unless explicitly overridden, and 'redis' in production.
 */
export function getPdfGenerationMode(): PdfGenerationMode {
    const configuredMode = process.env.PDF_GENERATION_MODE?.trim().toLowerCase();

    if (configuredMode === 'redis') {
        return 'redis';
    }

    if (configuredMode === 'sync') {
        return 'sync';
    }

    // Default to 'sync' in non-production environments to avoid Redis connection/polling overhead
    if (process.env.NODE_ENV === 'production') {
        return 'redis';
    }

    return 'sync';
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
            delay: 5000 // 5 seconds initial delay
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 100 // Keep at most 100 completed jobs
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
            count: 500 // Keep at most 500 failed jobs
        }
    };
}

