import { HTTPException } from 'hono/http-exception';
import { type DbClient } from '@sentinel/db';
import { updateQuestionBankCollectionData } from '../data/update-question-bank-collection';
import {
    buildUpdateQuestionBankCollectionValues,
    resolveQuestionBankCollectionInstitutionId,
} from './build-question-bank-collection-write-values.service';
import { getQuestionBankCollectionByIdService } from './get-question-bank-collection-by-id.service';
import type { UpdateQuestionBankCollectionBody } from '../question-bank.dto';

export type UpdateQuestionBankCollectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    body: UpdateQuestionBankCollectionBody;
    institutionId: string | undefined;
    userId: string;
};

/**
 * Updates a question bank collection's metadata.
 * Throws a 404 HTTPException if the collection does not exist or is not accessible.
 */
export async function updateQuestionBankCollectionService({
    dbClient,
    id,
    body,
    institutionId,
    userId,
}: UpdateQuestionBankCollectionServiceArgs) {
    const updated = await updateQuestionBankCollectionData({
        dbClient,
        id,
        institutionId,
        values: buildUpdateQuestionBankCollectionValues({
            body,
            userId,
        }),
    });

    if (!updated) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }

    return await getQuestionBankCollectionByIdService({
        dbClient,
        id,
        institutionId:
            resolveQuestionBankCollectionInstitutionId(institutionId, body.institutionId) ??
            undefined,
        userId,
    });
}
