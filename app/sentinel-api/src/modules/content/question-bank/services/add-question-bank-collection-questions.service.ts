import { type DbClient, executeTransaction } from '@sentinel/db';
import { addQuestionBankCollectionQuestionsData } from '../data/add-question-bank-collection-questions';
import { getQuestionBankCollectionQuestionLinksData } from '../data/get-question-bank-collection-question-links';
import { buildQuestionBankCollectionQuestionLinkValues } from './build-question-bank-collection-question-link-values.service';
import { getQuestionBankCollectionOrThrow } from './assert-question-bank-collection.service';
import { createQuestionBankQuestions } from './create-question-bank-questions.service';
import { getQuestionBankCollectionByIdService } from './get-question-bank-collection-by-id.service';
import type { CreateQuestionBankCollectionBody } from '../question-bank.dto';

export type AddQuestionsToCollectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    questionIds: string[];
    questions: CreateQuestionBankCollectionBody['questions'] | undefined;
    userId: string;
    institutionId?: string;
};

/**
 * Adds questions to an existing collection, deduplicating against already-linked questions.
 * Creates any inline question payloads before linking.
 */
export async function addQuestionsToCollectionService({
    dbClient,
    id,
    questionIds,
    questions,
    userId,
    institutionId,
}: AddQuestionsToCollectionServiceArgs) {
    await executeTransaction(async (trx) => {
        await getQuestionBankCollectionOrThrow({
            dbClient: trx,
            id,
            institutionId,
            userId,
        });

        const existingLinks = await getQuestionBankCollectionQuestionLinksData({
            dbClient: trx,
            collectionId: id,
        });

        const existingIds = new Set(existingLinks.map((item) => item.question_bank_question_id));
        const nextOrderIndex = existingLinks.length;

        const createdQuestionIds = await createQuestionBankQuestions({
            dbClient: trx,
            questions,
            institutionId: institutionId ?? null,
            userId,
        });

        const candidateQuestionIds = [...questionIds, ...createdQuestionIds];

        const newQuestionIds = candidateQuestionIds.filter(
            (questionId) => !existingIds.has(questionId),
        );

        await addQuestionBankCollectionQuestionsData({
            dbClient: trx,
            values: buildQuestionBankCollectionQuestionLinkValues({
                collectionId: id,
                questionIds: newQuestionIds,
                startOrderIndex: nextOrderIndex,
            }),
        });
    });

    return await getQuestionBankCollectionByIdService({ dbClient, id, institutionId, userId });
}
