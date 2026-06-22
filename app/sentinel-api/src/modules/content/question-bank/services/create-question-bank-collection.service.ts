import { type DbClient, executeTransaction } from '@sentinel/db';
import { addQuestionBankCollectionQuestionsData } from '../data/add-question-bank-collection-questions';
import { createQuestionBankCollectionData } from '../data/create-question-bank-collection';
import { buildQuestionBankCollectionQuestionLinkValues } from './build-question-bank-collection-question-link-values.service';
import {
    buildCreateQuestionBankCollectionValues,
    resolveQuestionBankCollectionInstitutionId,
} from './build-question-bank-collection-write-values.service';
import { createQuestionBankQuestions } from './create-question-bank-questions.service';
import { getQuestionBankCollectionByIdService } from './get-question-bank-collection-by-id.service';
import type { CreateQuestionBankCollectionBody } from '../question-bank.dto';

export type CreateQuestionBankCollectionServiceArgs = {
    dbClient: DbClient;
    body: CreateQuestionBankCollectionBody;
    institutionId: string | undefined;
    userId: string;
};

/**
 * Creates a new question bank collection within a transaction.
 * Handles creating inline questions and linking existing question IDs.
 */
export async function createQuestionBankCollectionService({
    dbClient,
    body,
    institutionId,
    userId,
}: CreateQuestionBankCollectionServiceArgs) {
    const scopedInstitutionId = resolveQuestionBankCollectionInstitutionId(
        institutionId,
        body.institutionId,
    );

    const createdCollection = await executeTransaction(async (trx) => {
        const collection = await createQuestionBankCollectionData({
            dbClient: trx,
            values: buildCreateQuestionBankCollectionValues({
                body,
                institutionId: scopedInstitutionId,
                userId,
            }),
        });

        const createdQuestionIds = await createQuestionBankQuestions({
            dbClient: trx,
            questions: body.questions,
            institutionId: scopedInstitutionId,
            userId,
        });
        const orderedQuestionIds = [...(body.questionIds ?? []), ...createdQuestionIds];

        if (orderedQuestionIds.length) {
            await addQuestionBankCollectionQuestionsData({
                dbClient: trx,
                values: buildQuestionBankCollectionQuestionLinkValues({
                    collectionId: collection.collection_id,
                    questionIds: orderedQuestionIds,
                }),
            });
        }

        return collection;
    });

    return await getQuestionBankCollectionByIdService({
        dbClient,
        id: createdCollection.collection_id,
        institutionId: scopedInstitutionId ?? undefined,
        userId,
    });
}
