import type { DbClient } from '@sentinel/db';
import type {
    AiGenerationJobRecord,
    GetExpiredAiGenerationJobsArgs,
} from './ai-generation-job.types';
import { mapAiGenerationJobRecord } from './ai-generation-job.mapper';

/**
 * Retrieves an AI generation job by its unique UUID.
 */
export async function getJobByIdQuery(
    client: DbClient,
    id: string,
): Promise<AiGenerationJobRecord | null> {
    const row = await client
        .selectFrom('ai_generation_jobs')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst();

    return row ? mapAiGenerationJobRecord(row) : null;
}

/**
 * Finds expired generation jobs whose 24-hour TTL has passed.
 */
export async function getExpiredJobsQuery(
    client: DbClient,
    args?: GetExpiredAiGenerationJobsArgs,
): Promise<AiGenerationJobRecord[]> {
    const now = new Date();

    let query = client
        .selectFrom('ai_generation_jobs')
        .where('expires_at', '<', now)
        .selectAll();

    if (args?.limit) {
        query = query.limit(args.limit);
    }

    const rows = await query.execute();
    return rows.map((row) => mapAiGenerationJobRecord(row));
}
