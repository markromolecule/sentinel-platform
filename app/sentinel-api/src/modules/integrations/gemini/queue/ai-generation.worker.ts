import { Worker, Job } from 'bullmq';
import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import { createRedisConnection, closeRedisConnection, hasRedisConfigured } from '../../../../lib/redis/redis.service';
import {
    getAiGenerationQueueName,
    getAiWorkerConcurrency,
    resolveQueueOperationalMode,
    DEFAULT_LOCK_DURATION_MS,
    DEFAULT_STALLED_INTERVAL_MS,
    DEFAULT_MAX_STALLED_COUNT,
} from './ai-generation-queue.config';
import { AiJobFileStagingService } from '../services/ai-job-file-staging.service';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import { QuestionGeneratorService } from '../../../../lib/gemini/services/question-generator';

export type AiGenerationJobData = {
    jobId: string;
    userId: string;
    institutionId?: string | null;
    config: GenerateQuestionPreviewConfig;
};

export class AiGenerationWorkerProcessor {
    /**
     * Executes the generation pipeline for an enqueued job.
     */
    static async processJob(data: AiGenerationJobData): Promise<void> {
        const { jobId, config } = data;
        console.log(`[AiWorker] Starting generation for job ${jobId}`);

        try {
            const files = await AiJobFileStagingService.loadStagedFiles(jobId);

            if (!files || files.length === 0) {
                const errMsg = 'No staged document files found for generation job';
                console.error(`[AiWorker] ${errMsg} (${jobId})`);
                await AiGenerationJobRepository.failJob({ id: jobId, error: errMsg });
                return;
            }

            await AiGenerationJobRepository.updateProgress({
                id: jobId,
                progress: 5,
                currentStep: 'Staging lecture documents...',
                status: 'processing',
            });

            const result = await QuestionGeneratorService.generatePreviewFromPdf({
                files,
                config,
                onProgress: async (progress, step) => {
                    await AiGenerationJobRepository.updateProgress({
                        id: jobId,
                        progress,
                        currentStep: step,
                        status: 'processing',
                    });
                },
            });

            await AiGenerationJobRepository.completeJob({
                id: jobId,
                result,
            });

            console.log(`[AiWorker] Successfully completed generation for job ${jobId}`);
        } catch (error: any) {
            const errorMsg = error?.message || 'AI generation failed due to an unexpected error.';
            console.error(`[AiWorker] Job ${jobId} failed:`, errorMsg);
            await AiGenerationJobRepository.failJob({
                id: jobId,
                error: errorMsg,
            });
            throw error;
        } finally {
            await AiJobFileStagingService.cleanupJobFiles(jobId);
        }
    }
}

let worker: Worker<AiGenerationJobData> | null = null;
let workerConnection: any = null;
let maintenanceInterval: NodeJS.Timeout | null = null;

const MAINTENANCE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Initializes and starts the background BullMQ Worker for AI Question Generation.
 */
export async function startAiGenerationWorker(): Promise<Worker<AiGenerationJobData> | null> {
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
    await AiJobFileStagingService.sweepStaleJobFiles();
    await AiGenerationJobRepository.reconcileStuckJobs(15);

    // 2. Schedule recurring periodic sweep & reconciliation
    if (!maintenanceInterval) {
        maintenanceInterval = setInterval(async () => {
            try {
                await AiJobFileStagingService.sweepStaleJobFiles();
                await AiGenerationJobRepository.reconcileStuckJobs(15);
            } catch (err) {
                console.error('[AiWorker] Error during scheduled maintenance cycle:', err);
            }
        }, MAINTENANCE_INTERVAL_MS);
        maintenanceInterval.unref();
    }

    workerConnection = createRedisConnection('worker');

    worker = new Worker<AiGenerationJobData>(
        queueName,
        async (job: Job<AiGenerationJobData>) => {
            await AiGenerationWorkerProcessor.processJob(job.data);
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
            console.error(`[AiWorker] Job ${job.id} (generation: ${job.data?.jobId}) failed:`, err.message);
            try {
                await AiGenerationJobRepository.failJob({
                    id: job.data.jobId,
                    error: err.message || 'Worker processing failure',
                });
            } catch (failErr) {
                console.error('[AiWorker] Failed to update job status on worker failure event:', failErr);
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
