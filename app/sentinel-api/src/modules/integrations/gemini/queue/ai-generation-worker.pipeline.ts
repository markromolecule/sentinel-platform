import type { DbClient } from '@sentinel/db';
import {
    AiGenerationInputStorageService,
    AiGenerationInputStorageError,
    type AiGenerationInputManifest,
} from '../services/ai-generation-input-storage.service';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import { QuestionGeneratorService } from '../../../../lib/gemini/services/question-generator';
import type { AiGenerationJobData, ProcessJobContext } from './ai-generation-worker.types';

/**
 * Resolves the Supabase storage input manifest from job payload or falls back to database lookup.
 */
export async function resolveStorageManifest(
    data: AiGenerationJobData,
    db?: DbClient,
): Promise<AiGenerationInputManifest | null> {
    if (data.storageBucket && data.storagePaths && data.storagePaths.length > 0) {
        return {
            bucket: data.storageBucket,
            objects: data.storagePaths,
        };
    }

    const jobRecord = await AiGenerationJobRepository.getJobById(data.jobId, db);
    if (
        jobRecord?.storage_bucket &&
        jobRecord.storage_paths &&
        jobRecord.storage_paths.length > 0
    ) {
        return {
            bucket: jobRecord.storage_bucket,
            objects: jobRecord.storage_paths,
        };
    }

    return null;
}

/**
 * Handles permanent non-retryable input errors by marking the job failed and discarding from queue.
 */
export async function handleFatalInputError(
    jobId: string,
    error: string,
    context?: ProcessJobContext,
): Promise<void> {
    console.error(`[AiWorker] [${jobId}] Permanent input error: ${error}`);
    await AiGenerationJobRepository.failJob({
        id: jobId,
        error,
        db: context?.db,
    });
    if (context?.discard) {
        await context.discard();
    }
}

/**
 * Executes the generation pipeline for an enqueued job:
 * 1. Resolves input manifest
 * 2. Downloads files from storage
 * 3. Records progress milestones
 * 4. Invokes QuestionGeneratorService
 * 5. Persists completion or handles retry/failure
 */
export async function executeAiGenerationJob(
    data: AiGenerationJobData,
    context?: ProcessJobContext,
): Promise<void> {
    const { jobId, config } = data;
    const attempt = context?.attempt ?? 1;
    const maxAttempts = context?.maxAttempts ?? 1;
    let lastProgress = 0;

    console.log(`[AiWorker] [${jobId}] Starting generation (attempt ${attempt}/${maxAttempts})`);

    try {
        // 1. Resolve storage manifest
        const manifest = await resolveStorageManifest(data, context?.db);
        if (!manifest || manifest.objects.length === 0) {
            await handleFatalInputError(
                jobId,
                'No staged document files found for generation job',
                context,
            );
            return;
        }

        // 2. Download files from Supabase Storage
        console.log(
            `[AiWorker] [${jobId}] Retrieving stored input manifest (${manifest.objects.length} objects)`,
        );

        let files: File[];
        try {
            files = await AiGenerationInputStorageService.downloadManifestFiles(manifest);
        } catch (storageErr) {
            if (
                storageErr instanceof AiGenerationInputStorageError &&
                !storageErr.retryable
            ) {
                console.error(
                    `[AiWorker] [${jobId}] Permanent storage input error (not retrying): ${storageErr.message}`,
                );
                await handleFatalInputError(
                    jobId,
                    'No staged document files found for generation job',
                    context,
                );
                return;
            }
            throw storageErr;
        }

        if (!files || files.length === 0) {
            await handleFatalInputError(
                jobId,
                'No staged document files found for generation job',
                context,
            );
            return;
        }

        console.log(
            `[AiWorker] [${jobId}] Successfully retrieved stored input files (${files.length} files)`,
        );

        // 3. Write first processing progress milestone ONLY AFTER retrieval succeeds
        lastProgress = 5;
        await AiGenerationJobRepository.updateProgress({
            id: jobId,
            progress: 5,
            currentStep: 'Staging lecture documents...',
            status: 'processing',
            db: context?.db,
        });

        // 4. Generate questions via QuestionGeneratorService
        const result = await QuestionGeneratorService.generatePreviewFromPdf({
            files,
            config,
            onProgress: async (progress, step) => {
                lastProgress = progress;
                await AiGenerationJobRepository.updateProgress({
                    id: jobId,
                    progress,
                    currentStep: step,
                    status: 'processing',
                    db: context?.db,
                });
            },
        });

        // 5. Complete job
        await AiGenerationJobRepository.completeJob({
            id: jobId,
            result,
            db: context?.db,
        });

        console.log(`[AiWorker] [${jobId}] Successfully completed generation`);
    } catch (error: any) {
        const errorMsg = error?.message || 'AI generation failed due to an unexpected error.';
        const isFinalAttempt = attempt >= maxAttempts;

        if (isFinalAttempt) {
            console.error(
                `[AiWorker] [${jobId}] Exhausted all ${maxAttempts} attempts. Final failure:`,
                errorMsg,
            );
            await AiGenerationJobRepository.failJob({
                id: jobId,
                error: errorMsg,
                db: context?.db,
            });
        } else {
            console.warn(
                `[AiWorker] [${jobId}] Attempt ${attempt}/${maxAttempts} failed, scheduled for retry:`,
                errorMsg,
            );
            await AiGenerationJobRepository.updateProgress({
                id: jobId,
                progress: lastProgress || 5,
                currentStep: `Temporary failure encountered. Retrying attempt ${attempt + 1} of ${maxAttempts}...`,
                status: 'processing',
                db: context?.db,
            });
        }

        throw error;
    }
}
