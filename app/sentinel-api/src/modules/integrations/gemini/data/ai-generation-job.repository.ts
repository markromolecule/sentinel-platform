import { dbClient as defaultDbClient, type DbClient } from '@sentinel/db';
import type { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import type {
    AiGenerationJobRecord,
    CreateAiGenerationJobParams,
    GetExpiredAiGenerationJobsArgs,
} from './ai-generation-job.types';
import { getJobByIdQuery, getExpiredJobsQuery } from './ai-generation-job.queries';
import {
    createJobMutation,
    updateProgressMutation,
    completeJobMutation,
    failJobMutation,
    reconcileStuckJobsMutation,
    purgeExpiredJobsMutation,
    deleteJobMutation,
} from './ai-generation-job.mutations';

export * from './ai-generation-job.types';
export * from './ai-generation-job.mapper';
export * from './ai-generation-job.queries';
export * from './ai-generation-job.mutations';

/**
 * Facade repository for AI question generation job persistence.
 *
 * Implementation is modularized into focused units:
 * - ai-generation-job.types.ts: Domain models and parameter shapes
 * - ai-generation-job.mapper.ts: Database row mapping and safe parsing
 * - ai-generation-job.queries.ts: Read queries
 * - ai-generation-job.mutations.ts: Write mutations
 */
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
        return createJobMutation(this.resolveClient(db), params);
    }

    /**
     * Retrieves an AI generation job by its unique UUID.
     */
    static async getJobById(
        id: string,
        db?: DbClient,
    ): Promise<AiGenerationJobRecord | null> {
        return getJobByIdQuery(this.resolveClient(db), id);
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
        return updateProgressMutation(this.resolveClient(args.db), args);
    }

    /**
     * Marks a job as completed and stores the final structured preview questions payload.
     */
    static async completeJob(args: {
        id: string;
        result: GenerateQuestionPreviewResponse;
        db?: DbClient;
    }): Promise<void> {
        return completeJobMutation(this.resolveClient(args.db), args);
    }

    /**
     * Marks a job as failed with a sanitized error message.
     */
    static async failJob(args: {
        id: string;
        error: string;
        db?: DbClient;
    }): Promise<void> {
        return failJobMutation(this.resolveClient(args.db), args);
    }

    /**
     * Reconciles stuck or orphaned jobs left in queued/processing states without updates.
     */
    static async reconcileStuckJobs(
        olderThanMinutes: number = 15,
        db?: DbClient,
    ): Promise<number> {
        return reconcileStuckJobsMutation(this.resolveClient(db), olderThanMinutes);
    }

    /**
     * Purges expired generation jobs older than their 24-hour TTL.
     */
    static async purgeExpiredJobs(db?: DbClient): Promise<number> {
        return purgeExpiredJobsMutation(this.resolveClient(db));
    }

    /**
     * Finds expired generation jobs whose TTL has passed.
     */
    static async getExpiredJobs(args?: {
        limit?: number;
        db?: DbClient;
    }): Promise<AiGenerationJobRecord[]> {
        return getExpiredJobsQuery(this.resolveClient(args?.db), args);
    }

    /**
     * Deletes a single generation job by its unique UUID.
     */
    static async deleteJob(id: string, db?: DbClient): Promise<boolean> {
        return deleteJobMutation(this.resolveClient(db), id);
    }
}
