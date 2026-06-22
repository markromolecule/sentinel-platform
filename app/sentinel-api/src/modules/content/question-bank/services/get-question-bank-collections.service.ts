import { type DbClient } from '@sentinel/db';
import { getQuestionBankCollectionsData } from '../data/get-question-bank-collections';
import {
    mapQuestionBankCollectionResponse,
    type RawCollectionRecord,
} from './map-question-bank-collection-response.service';
import type {
    GetQuestionBankCollectionsQuery,
    QuestionBankCollectionPageRecord,
} from '../question-bank.dto';

export type GetQuestionBankCollectionsServiceArgs = {
    dbClient: DbClient;
    filters: GetQuestionBankCollectionsQuery;
    institutionId?: string;
    userId?: string;
};

/**
 * Returns the visible question bank collections as a paginated envelope.
 */
export async function getQuestionBankCollectionsService({
    dbClient,
    filters,
    institutionId,
    userId,
}: GetQuestionBankCollectionsServiceArgs): Promise<QuestionBankCollectionPageRecord> {
    const page = await getQuestionBankCollectionsData({
        dbClient,
        institutionId,
        filters,
        userId: userId ?? '',
    });

    return {
        ...page,
        items: page.items.map((record: RawCollectionRecord) =>
            mapQuestionBankCollectionResponse({
                record,
                questionIds: [],
            }),
        ),
    };
}
