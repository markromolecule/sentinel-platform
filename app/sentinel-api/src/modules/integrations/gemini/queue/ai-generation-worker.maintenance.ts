import type { DbClient } from '@sentinel/db';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import { AiGenerationInputStorageService } from '../services/ai-generation-input-storage.service';
import type {
    CleanExpiredJobsResult,
    MaintenanceCycleResult,
} from './ai-generation-worker.types';

/**
 * Finds expired jobs, idempotently removes their storage objects,
 * and purges the database rows only after successful/converged object deletion.
 * Retains failed cleanup candidates for the next cycle.
 */
export async function cleanExpiredAiGenerationJobs(
    db?: DbClient,
): Promise<CleanExpiredJobsResult> {
    const expiredJobs = await AiGenerationJobRepository.getExpiredJobs({ limit: 50, db });
    let cleanedCount = 0;
    let failedCount = 0;

    for (const job of expiredJobs) {
        try {
            if (job.storage_bucket && job.storage_paths && job.storage_paths.length > 0) {
                await AiGenerationInputStorageService.deleteObjects({
                    bucket: job.storage_bucket,
                    paths: job.storage_paths.map((p) => p.path),
                });
            }

            await AiGenerationJobRepository.deleteJob(job.id, db);
            cleanedCount++;
            console.log(`[AiCleanup] [${job.id}] Successfully purged expired job and storage inputs`);
        } catch (err: unknown) {
            failedCount++;
            console.error(
                `[AiCleanup] [${job.id}] Failed to delete storage inputs for expired job:`,
                err instanceof Error ? err.message : err,
            );
            // Keep the DB row for the next maintenance cycle
        }
    }

    return {
        checkedCount: expiredJobs.length,
        cleanedCount,
        failedCount,
    };
}

/**
 * Runs startup and recurring maintenance: stuck job reconciliation and expired job cleanup.
 */
export async function runAiGenerationMaintenance(
    db?: DbClient,
    cleanFn: (db?: DbClient) => Promise<CleanExpiredJobsResult> = cleanExpiredAiGenerationJobs,
): Promise<MaintenanceCycleResult> {
    const reconciledCount = await AiGenerationJobRepository.reconcileStuckJobs(15, db);
    const cleanup = await cleanFn(db);
    return {
        reconciledCount,
        cleanup,
    };
}
