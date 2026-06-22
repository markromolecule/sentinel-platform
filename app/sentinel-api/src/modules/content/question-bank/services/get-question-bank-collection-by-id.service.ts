import { type DbClient } from '@sentinel/db';
import { getQuestionBankCollectionDetailOrThrow } from './get-question-bank-collection-detail.service';

export type GetQuestionBankCollectionByIdServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    userId?: string;
};

/**
 * Fetches a single question bank collection with its questions and metadata.
 * Throws a 404 HTTPException if the collection is not found or not accessible.
 */
export async function getQuestionBankCollectionByIdService({
    dbClient,
    id,
    institutionId,
    userId,
}: GetQuestionBankCollectionByIdServiceArgs) {
    return await getQuestionBankCollectionDetailOrThrow({
        dbClient,
        id,
        institutionId,
        userId: userId ?? '',
    });
}
