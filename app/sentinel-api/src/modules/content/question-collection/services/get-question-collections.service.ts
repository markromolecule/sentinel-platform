import { type DbClient } from '@sentinel/db';
import type { GetQuestionCollectionsQuery } from '../question-collection.dto';
import { getQuestionCollectionsData } from '../data/get-question-collections';
import { mapQuestionCollectionResponse } from './map-question-collection-response.service';

export async function getQuestionCollections(
    dbClient: DbClient,
    filters: GetQuestionCollectionsQuery,
    institutionId?: string,
) {
    const records = await getQuestionCollectionsData({
        dbClient,
        institutionId,
        filters,
    });

    return records.map((record) =>
        mapQuestionCollectionResponse({
            record,
            questionIds: [],
        }),
    );
}
