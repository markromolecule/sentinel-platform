import { type DbClient } from '@sentinel/db';
import { type GetQuestionTypeCountsQuery } from '../question.dto';
import { getQuestionTypeCountsData } from '../data/get-question-type-counts';

export type GetQuestionTypeCountsServiceArgs = {
    dbClient: DbClient;
    filters: GetQuestionTypeCountsQuery;
    institutionId?: string;
    userId?: string;
};

/**
 * Fetches counts of questions grouped by their type, scoped to the current user's visibility.
 *
 * @param args.dbClient - Database client
 * @param args.filters - Query filters (search, collectionId, subjectId, etc.)
 * @param args.institutionId - Institution context
 * @param args.userId - Acting user ID
 * @returns Object with aggregated type counts list and total.
 */
export async function getQuestionTypeCountsService({
    dbClient,
    filters,
    institutionId,
    userId,
}: GetQuestionTypeCountsServiceArgs) {
    return getQuestionTypeCountsData({
        dbClient,
        institutionId,
        filters,
        userId,
    });
}
