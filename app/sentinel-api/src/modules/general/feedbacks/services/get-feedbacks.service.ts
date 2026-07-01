import { type DbClient } from '@sentinel/db';
import type { FeedbackPage, GetFeedbacksQuery } from '@sentinel/shared/schema';
import { getFeedbacksData } from '../data/get-feedbacks';
import { serializeFeedbackRecord } from './create-feedback.service';

export async function getFeedbacks(
    dbClient: DbClient,
    args: GetFeedbacksQuery & {
        institutionId?: string;
        canViewAllInstitutions?: boolean;
    },
): Promise<FeedbackPage> {
    const result = await getFeedbacksData(dbClient, args);

    return {
        items: result.items.map((item) => serializeFeedbackRecord(item)),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
    };
}
