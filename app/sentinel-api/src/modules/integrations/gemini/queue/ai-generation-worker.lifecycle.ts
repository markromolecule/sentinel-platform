import { Worker, Job } from 'bullmq';
import {
    createRedisConnection,
    closeRedisConnection,
    hasRedisConfigured,
} from '../../../../lib/redis/redis.service';
import {
    getAiGenerationQueueName,
    getAiWorkerConcurrency,
    getAiWorkerDrainDelaySeconds,
    getAiWorkerStalledIntervalMs,
    resolveQueueOperationalMode,
    DEFAULT_LOCK_DURATION_MS,
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

export const DEFAULT_CIRCUIT_BREAKER_BASE_DELAY_MS = 5_000;
export const DEFAULT_CIRCUIT_BREAKER_MAX_DELAY_MS = 30_000;
export const DEFAULT_ERROR_LOG_THROTTLE_MS = 10_000;

let consecutiveErrors = 0;
let backoffTimer: NodeJS.Timeout | null = null;
let isBackoffActive = false;
let lastErrorLogTime = 0;

export function getWorkerCircuitBreakerState() {
    return {
        consecutiveErrors,
        isBackoffActive,
        isPaused: worker?.isPaused() ?? false,
    };
}

export function resetCircuitBreakerForTesting() {
    if (backoffTimer) {
        clearTimeout(backoffTimer);
        backoffTimer = null;
    }
    isBackoffActive = false;
    consecutiveErrors = 0;
    lastErrorLogTime = 0;
}

export async function handleWorkerError(
    err: Error,
    targetWorker: Worker<AiGenerationJobData> | null = worker,
    options?: {
        baseDelayMs?: number;
        maxDelayMs?: number;
        logThrottleMs?: number;
    },
): Promise<number | null> {
    consecutiveErrors++;
    const now = Date.now();
    const logThrottleMs = options?.logThrottleMs ?? DEFAULT_ERROR_LOG_THROTTLE_MS;

    if (now - lastErrorLogTime >= logThrottleMs) {
        lastErrorLogTime = now;
        console.error(
            `[AiWorker] Worker internal error (consecutive failures: ${consecutiveErrors}):`,
            err.message || err,
        );
    }

    if (!isBackoffActive && targetWorker) {
        isBackoffActive = true;
        const baseDelay = options?.baseDelayMs ?? DEFAULT_CIRCUIT_BREAKER_BASE_DELAY_MS;
        const maxDelay = options?.maxDelayMs ?? DEFAULT_CIRCUIT_BREAKER_MAX_DELAY_MS;
        const backoffDelay = Math.min(
            baseDelay * Math.pow(2, Math.min(consecutiveErrors - 1, 3)),
            maxDelay,
        );

        console.warn(
            `[AiWorker] Circuit breaker tripped. Pausing worker for ${backoffDelay / 1000}s to prevent runaway CPU spin...`,
        );

        try {
            await targetWorker.pause(true);
        } catch (pauseErr) {
            console.error('[AiWorker] Failed to pause worker during circuit breaker trip:', pauseErr);
        }

        if (backoffTimer) {
            clearTimeout(backoffTimer);
        }

        backoffTimer = setTimeout(async () => {
            isBackoffActive = false;
            backoffTimer = null;
            if (targetWorker && !targetWorker.closing) {
                try {
                    await targetWorker.resume();
                    console.log('[AiWorker] Circuit breaker backoff window elapsed. Resumed worker.');
                } catch (resumeErr) {
                    console.error('[AiWorker] Failed to resume worker after backoff:', resumeErr);
                }
            }
        }, backoffDelay);
        backoffTimer.unref();

        return backoffDelay;
    }

    return null;
}

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
    const drainDelay = getAiWorkerDrainDelaySeconds();
    const stalledInterval = getAiWorkerStalledIntervalMs();

    console.log(
        `[AiWorker] Starting BullMQ AI Worker on queue "${queueName}" (concurrency: ${concurrency}, drainDelay: ${drainDelay}s, stalledInterval: ${stalledInterval}ms)...`,
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
            drainDelay,
            lockDuration: DEFAULT_LOCK_DURATION_MS,
            stalledInterval,
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

    worker.on('completed', () => {
        if (consecutiveErrors > 0) {
            consecutiveErrors = 0;
        }
    });

    worker.on('error', (err) => {
        void handleWorkerError(err, worker);
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

    if (backoffTimer) {
        clearTimeout(backoffTimer);
        backoffTimer = null;
    }
    isBackoffActive = false;
    consecutiveErrors = 0;

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
