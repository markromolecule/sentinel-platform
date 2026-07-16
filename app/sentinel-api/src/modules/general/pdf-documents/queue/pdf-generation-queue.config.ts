import { JobsOptions } from 'bullmq';

export const PDF_QUEUE_NAME = 'pdf-generation';

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
