import { type DbClient } from '@sentinel/db';
import { type GetQuestionsQuery } from '../question.dto';
import { getQuestionsData } from '../data/get-questions';
import { getQuestionByIdData } from '../data/get-question-by-id';
import { mapQuestionResponse } from './map-question-response';
import { HTTPException } from 'hono/http-exception';

// ---------------------------------------------------------------------------
// Get paginated question list
// ---------------------------------------------------------------------------

export type GetQuestionsServiceArgs = {
    dbClient: DbClient;
    filters: GetQuestionsQuery;
    institutionId?: string;
    userId?: string;
};

/**
 * Fetches a paginated list of questions with the current user's visibility
 * context applied. Each item is mapped to the public response shape.
 *
 * @param args.dbClient - Database client
 * @param args.filters - Query filters (type, difficulty, search, page, etc.)
 * @param args.institutionId - Institution context
 * @param args.userId - Acting user for visibility scoping
 * @returns Paginated page object with mapped question items
 */
export async function getQuestionsService({
    dbClient,
    filters,
    institutionId,
    userId,
}: GetQuestionsServiceArgs) {
    const page = await getQuestionsData({ dbClient, institutionId, filters, userId });

    return {
        ...page,
        items: page.items.map(mapQuestionResponse),
    };
}

// ---------------------------------------------------------------------------
// Get single question by ID
// ---------------------------------------------------------------------------

export type GetQuestionByIdServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

/**
 * Fetches a single question by ID and maps it to the public response shape.
 * Throws HTTP 404 when the question does not exist or is not visible.
 *
 * @param args.dbClient - Database client
 * @param args.id - Question ID
 * @param args.institutionId - Institution context
 * @returns Mapped question response
 */
export async function getQuestionByIdService({
    dbClient,
    id,
    institutionId,
}: GetQuestionByIdServiceArgs) {
    const record = await getQuestionByIdData({ dbClient, id, institutionId });

    if (!record) {
        throw new HTTPException(404, { message: 'Question not found.' });
    }

    return mapQuestionResponse(record);
}

export type GetQuestionByIdServiceResponse = Awaited<ReturnType<typeof getQuestionByIdService>>;
