import { dbClient as defaultDbClient, type DbClient } from '@sentinel/db';
import type {
    GenerateQuestionPreviewConfig,
    GenerateQuestionPreviewResponse,
} from '@sentinel/shared';

export type AiGenerationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type CreateAiGenerationJobParams = {
    id?: string;
    userId: string;
    institutionId?: string | null;
    config: GenerateQuestionPreviewConfig;
    ttlHours?: number;
};

export type AiGenerationJobRecord = {
    id: string;
    user_id: string;
    institution_id: string | null;
    status: AiGenerationJobStatus;
    progress: number;
    current_step: string | null;
    config: GenerateQuestionPreviewConfig;
    result: GenerateQuestionPreviewResponse | null;
    error: string | null;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
};

export class AiGenerationJobRepository {
    private static resolveClient(db?: DbClient): DbClient {
        return db ?? defaultDbClient;
    }

    /**
     * Inserts a new asynchronous AI generation job with a 24-hour TTL.
     */
    static async createJob(
        params: CreateAiGenerationJobParams,
        db?: DbClient,
    ): Promise<AiGenerationJobRecord> {
        const client = this.resolveClient(db);
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
                config: params.config as any,
                result: null,
                error: null,
                expires_at: expiresAt,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

        return this.mapRecord(row);
    }

    /**
     * Retrieves an AI generation job by its unique UUID.
     */
    static async getJobById(
        id: string,
        db?: DbClient,
    ): Promise<AiGenerationJobRecord | null> {
        const client = this.resolveClient(db);
        const row = await client
            .selectFrom('ai_generation_jobs')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst();

        return row ? this.mapRecord(row) : null;
    }

    /**
     * Atomically updates progress percentage and current step milestone.
     */
    static async updateProgress(args: {
        id: string;
        progress: number;
        currentStep: string;
        status?: 'queued' | 'processing';
        db?: DbClient;
    }): Promise<void> {
        const client = this.resolveClient(args.db);
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
    static async completeJob(args: {
        id: string;
        result: GenerateQuestionPreviewResponse;
        db?: DbClient;
    }): Promise<void> {
        const client = this.resolveClient(args.db);
        await client
            .updateTable('ai_generation_jobs')
            .set({
                status: 'completed',
                progress: 100,
                current_step: 'Generation completed successfully',
                result: args.result as any,
                error: null,
                updated_at: new Date(),
            })
            .where('id', '=', args.id)
            .execute();
    }

    /**
     * Marks a job as failed with a sanitized error message.
     */
    static async failJob(args: {
        id: string;
        error: string;
        db?: DbClient;
    }): Promise<void> {
        const client = this.resolveClient(args.db);
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
     * Transitions them to 'failed' to prevent infinite loading spinners on the frontend.
     */
    static async reconcileStuckJobs(
        olderThanMinutes: number = 15,
        db?: DbClient,
    ): Promise<number> {
        const client = this.resolveClient(db);
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
    static async purgeExpiredJobs(db?: DbClient): Promise<number> {
        const client = this.resolveClient(db);
        const now = new Date();

        const result = await client
            .deleteFrom('ai_generation_jobs')
            .where('expires_at', '<', now)
            .executeTakeFirst();

        return Number(result.numDeletedRows ?? 0);
    }

    private static mapRecord(row: any): AiGenerationJobRecord {
        return {
            id: row.id,
            user_id: row.user_id,
            institution_id: row.institution_id ?? null,
            status: row.status as AiGenerationJobStatus,
            progress: Number(row.progress),
            current_step: row.current_step ?? null,
            config:
                typeof row.config === 'string'
                    ? JSON.parse(row.config)
                    : (row.config as GenerateQuestionPreviewConfig),
            result: row.result
                ? typeof row.result === 'string'
                    ? JSON.parse(row.result)
                    : (row.result as GenerateQuestionPreviewResponse)
                : null,
            error: row.error ?? null,
            expires_at: new Date(row.expires_at),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at),
        };
    }
}
