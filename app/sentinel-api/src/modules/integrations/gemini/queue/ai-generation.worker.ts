import type { DbClient } from '@sentinel/db';
import type { Worker } from 'bullmq';
import type {
    AiGenerationJobData,
    ProcessJobContext,
    CleanExpiredJobsResult,
    MaintenanceCycleResult,
} from './ai-generation-worker.types';
import { executeAiGenerationJob } from './ai-generation-worker.pipeline';
import {
    cleanExpiredAiGenerationJobs,
    runAiGenerationMaintenance,
} from './ai-generation-worker.maintenance';
import {
    startAiGenerationWorker as startWorkerInternal,
    stopAiGenerationWorker,
    getAiGenerationWorker,
} from './ai-generation-worker.lifecycle';

export * from './ai-generation-worker.types';
export * from './ai-generation-worker.pipeline';
export * from './ai-generation-worker.maintenance';
export * from './ai-generation-worker.lifecycle';

/**
 * Facade processor for AI Question Generation queue jobs.
 *
 * Decomposes worker responsibilities into focused submodules:
 * - ai-generation-worker.types.ts: Domain models and execution context
 * - ai-generation-worker.pipeline.ts: End-to-end question generation pipeline
 * - ai-generation-worker.maintenance.ts: Stuck job reconciliation and expired job cleanup
 * - ai-generation-worker.lifecycle.ts: BullMQ worker lifecycle and event management
 */
export class AiGenerationWorkerProcessor {
    /**
     * Executes the generation pipeline for an enqueued job.
     */
    static async processJob(
        data: AiGenerationJobData,
        context?: ProcessJobContext,
    ): Promise<void> {
        return executeAiGenerationJob(data, context);
    }

    /**
     * Finds expired jobs, idempotently removes their storage objects,
     * and purges the database rows only after successful/converged object deletion.
     * Retains failed cleanup candidates for the next cycle.
     */
    static async cleanExpiredJobs(db?: DbClient): Promise<CleanExpiredJobsResult> {
        return cleanExpiredAiGenerationJobs(db);
    }

    /**
     * Runs startup and recurring maintenance: stuck job reconciliation and expired job cleanup.
     */
    static async runMaintenanceCycle(db?: DbClient): Promise<MaintenanceCycleResult> {
        return runAiGenerationMaintenance(db, (targetDb) => this.cleanExpiredJobs(targetDb));
    }
}

/**
 * Initializes and starts the background BullMQ Worker for AI Question Generation.
 * Delegates processing and maintenance through the AiGenerationWorkerProcessor facade.
 */
export async function startAiGenerationWorker(): Promise<Worker<AiGenerationJobData> | null> {
    return startWorkerInternal({
        processor: (data, ctx) => AiGenerationWorkerProcessor.processJob(data, ctx),
        maintenanceFn: () => AiGenerationWorkerProcessor.runMaintenanceCycle(),
    });
}

export { stopAiGenerationWorker, getAiGenerationWorker };
