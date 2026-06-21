import { type DbClient } from '@sentinel/db';
import type { GetQuestionCollectionsQuery } from '../question-collection.dto';
import { getQuestionCollectionsData } from '../data/get-question-collections';
import { mapQuestionCollectionResponse } from './map-question-collection-response.service';
import type { QuestionCollectionPageRecord } from '../question-collection.dto';

/**
 * Returns question collections visible to the current user.
 */
export async function getQuestionCollections(
    dbClient: DbClient,
    filters: GetQuestionCollectionsQuery,
    userId: string,
    institutionId?: string,
): Promise<QuestionCollectionPageRecord> {
    const page = await getQuestionCollectionsData({
        dbClient,
        institutionId,
        userId,
        filters,
    });

    return {
        ...page,
        items: page.items.map((record) =>
            mapQuestionCollectionResponse({
                record,
                questionIds: [],
            }),
        ),
    };
}
