import type { DbClient } from '@sentinel/db';
import type {
    AiGenerationJobRecord,
    CreateAiGenerationJobParams,
    UpdateAiGenerationProgressArgs,
    CompleteAiGenerationJobArgs,
    FailAiGenerationJobArgs,
} from './ai-generation-job.types';
import { mapAiGenerationJobRecord } from './ai-generation-job.mapper';

/**
 * Inserts a new asynchronous AI generation job with a 24-hour TTL.
 */
export async function createJobMutation(
    client: DbClient,
    params: CreateAiGenerationJobParams,
): Promise<AiGenerationJobRecord> {
    const ttlHours = params.ttlHours ?? 24;
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    const row = await client
        .insertInto('ai_generation_jobs')
        .values({
            id: params.id,
            user_id: params.userId,
            institution_id: params.institutionId ?? null,
            status: 'queued',
            progress: 0,
            current_step: 'Queued',
            config:
                typeof params.config === 'string'
                    ? params.config
                    : JSON.stringify(params.config),
            result: null,
            error: null,
            storage_bucket: params.storageBucket ?? null,
            storage_paths: params.storagePaths
                ? typeof params.storagePaths === 'string'
                    ? params.storagePaths
                    : JSON.stringify(params.storagePaths)
                : null,
            expires_at: expiresAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return mapAiGenerationJobRecord(row);
}

/**
 * Atomically updates progress percentage and current step milestone.
 */
export async function updateProgressMutation(
    client: DbClient,
    args: UpdateAiGenerationProgressArgs,
): Promise<void> {
    await client
        .updateTable('ai_generation_jobs')
        .set({
            status: args.status ?? 'processing',
            progress: Math.max(0, Math.min(100, Math.round(args.progress))),
            current_step: args.currentStep,
            updated_at: new Date(),
        })
        .where('id', '=', args.id)
        .execute();
}

/**
 * Marks a job as completed and stores the final structured preview questions payload.
 */
export async function completeJobMutation(
    client: DbClient,
    args: CompleteAiGenerationJobArgs,
): Promise<void> {
    await client
        .updateTable('ai_generation_jobs')
        .set({
            status: 'completed',
            progress: 100,
            current_step: 'Generation completed successfully',
            result: args.result,
            error: null,
            updated_at: new Date(),
        })
        .where('id', '=', args.id)
        .execute();
}

/**
 * Marks a job as failed with a sanitized error message.
 */
export async function failJobMutation(
    client: DbClient,
    args: FailAiGenerationJobArgs,
): Promise<void> {
    await client
        .updateTable('ai_generation_jobs')
        .set({
            status: 'failed',
            error: args.error,
            updated_at: new Date(),
        })
        .where('id', '=', args.id)
        .execute();
}

/**
 * Reconciles stuck or orphaned jobs left in queued/processing states without updates.
 */
export async function reconcileStuckJobsMutation(
    client: DbClient,
    olderThanMinutes: number = 15,
): Promise<number> {
    const threshold = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const result = await client
        .updateTable('ai_generation_jobs')
        .set({
            status: 'failed',
            error: 'Job timed out or worker process terminated unexpectedly',
            updated_at: new Date(),
        })
        .where('status', 'in', ['queued', 'processing'])
        .where('updated_at', '<', threshold)
        .executeTakeFirst();

    return Number(result.numUpdatedRows ?? 0);
}

/**
 * Purges expired generation jobs older than their 24-hour TTL.
 */
export async function purgeExpiredJobsMutation(client: DbClient): Promise<number> {
    const now = new Date();

    const result = await client
        .deleteFrom('ai_generation_jobs')
        .where('expires_at', '<', now)
        .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
}

/**
 * Deletes a single generation job by its unique UUID.
 */
export async function deleteJobMutation(
    client: DbClient,
    id: string,
): Promise<boolean> {
    const result = await client
        .deleteFrom('ai_generation_jobs')
        .where('id', '=', id)
        .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0) > 0;
}
