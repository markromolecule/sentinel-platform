import { Worker, Job } from 'bullmq';
import {
    createRedisConnection,
    closeRedisConnection,
    hasRedisConfigured,
} from '../../../../lib/redis/redis.service';
import {
    getAiGenerationQueueName,
    getAiWorkerConcurrency,
    resolveQueueOperationalMode,
    DEFAULT_LOCK_DURATION_MS,
    DEFAULT_STALLED_INTERVAL_MS,
    DEFAULT_MAX_STALLED_COUNT,
} from './ai-generation-queue.config';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import type { AiGenerationJobData, ProcessJobContext } from './ai-generation-worker.types';
import { executeAiGenerationJob } from './ai-generation-worker.pipeline';
import { runAiGenerationMaintenance } from './ai-generation-worker.maintenance';

let worker: Worker<AiGenerationJobData> | null = null;
let workerConnection: any = null;
let maintenanceInterval: NodeJS.Timeout | null = null;

const MAINTENANCE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export type StartAiWorkerOptions = {
    processor?: (data: AiGenerationJobData, context?: ProcessJobContext) => Promise<void>;
    maintenanceFn?: () => Promise<unknown>;
};

/**
 * Returns the currently running BullMQ Worker instance, if active.
 */
export function getAiGenerationWorker(): Worker<AiGenerationJobData> | null {
    return worker;
}

/**
 * Initializes and starts the background BullMQ Worker for AI Question Generation.
 */
export async function startAiGenerationWorker(
    options?: StartAiWorkerOptions,
): Promise<Worker<AiGenerationJobData> | null> {
    if (worker) return worker;

    const mode = resolveQueueOperationalMode();
    if (mode !== 'redis' || !hasRedisConfigured()) {
        console.log(`[AiWorker] Operational mode is "${mode}". Dedicated BullMQ worker is inactive.`);
        return null;
    }

    const queueName = getAiGenerationQueueName();
    const concurrency = getAiWorkerConcurrency();

    console.log(
        `[AiWorker] Starting BullMQ AI Worker on queue "${queueName}" (concurrency: ${concurrency})...`,
    );

    // 1. Run startup maintenance
    if (options?.maintenanceFn) {
        await options.maintenanceFn();
    } else {
        await runAiGenerationMaintenance();
    }

    // 2. Schedule recurring periodic sweep & reconciliation
    if (!maintenanceInterval) {
        maintenanceInterval = setInterval(async () => {
            try {
                if (options?.maintenanceFn) {
                    await options.maintenanceFn();
                } else {
                    await runAiGenerationMaintenance();
                }
            } catch (err) {
                console.error('[AiWorker] Error during scheduled maintenance cycle:', err);
            }
        }, MAINTENANCE_INTERVAL_MS);
        maintenanceInterval.unref();
    }

    workerConnection = createRedisConnection('worker');

    const processJobFn = options?.processor ?? executeAiGenerationJob;

    worker = new Worker<AiGenerationJobData>(
        queueName,
        async (job: Job<AiGenerationJobData>) => {
            const attempt = (job.attemptsMade ?? 0) + 1;
            const maxAttempts = job.opts.attempts ?? 3;
            await processJobFn(job.data, {
                attempt,
                maxAttempts,
                discard: () => job.discard(),
            });
        },
        {
            connection: workerConnection,
            concurrency,
            lockDuration: DEFAULT_LOCK_DURATION_MS,
            stalledInterval: DEFAULT_STALLED_INTERVAL_MS,
            maxStalledCount: DEFAULT_MAX_STALLED_COUNT,
        },
    );

    worker.on('failed', async (job, err) => {
        if (job) {
            const attemptsMade = job.attemptsMade ?? 0;
            const maxAttempts = job.opts.attempts ?? 3;
            const isFinal = attemptsMade >= maxAttempts;

            if (isFinal) {
                console.error(
                    `[AiWorker] [${job.data?.jobId}] Worker job ${job.id} failed terminally after ${attemptsMade} attempts:`,
                    err.message,
                );
                try {
                    await AiGenerationJobRepository.failJob({
                        id: job.data.jobId,
                        error: err.message || 'Worker processing failure',
                    });
                } catch (failErr) {
                    console.error(
                        `[AiWorker] [${job.data?.jobId}] Failed to update job status on worker failure event:`,
                        failErr,
                    );
                }
            } else {
                console.warn(
                    `[AiWorker] [${job.data?.jobId}] Worker job ${job.id} attempt ${attemptsMade}/${maxAttempts} failed, BullMQ retry scheduled:`,
                    err.message,
                );
            }
        }
    });

    worker.on('stalled', (jobId) => {
        console.warn(`[AiWorker] Warning: Job ${jobId} stalled and will be re-attempted or reconciled.`);
    });

    worker.on('error', (err) => {
        console.error('[AiWorker] Worker internal error:', err);
    });

    console.log(`[AiWorker] AI Generation Worker initialized successfully on queue "${queueName}".`);
    return worker;
}

/**
 * Gracefully shuts down the background BullMQ Worker and releases connections.
 */
export async function stopAiGenerationWorker(): Promise<void> {
    if (maintenanceInterval) {
        clearInterval(maintenanceInterval);
        maintenanceInterval = null;
    }

    if (worker) {
        console.log('[AiWorker] Closing BullMQ Worker...');
        try {
            await worker.close();
        } catch (err) {
            console.error('[AiWorker] Error closing worker:', err);
        }
        worker = null;
    }

    if (workerConnection) {
        await closeRedisConnection(workerConnection);
        workerConnection = null;
    }

    console.log('[AiWorker] AI Generation Worker stopped.');
}
