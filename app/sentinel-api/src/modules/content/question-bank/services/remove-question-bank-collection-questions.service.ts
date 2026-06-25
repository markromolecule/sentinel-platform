import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions.service';
import { addQuestionBankCollectionQuestionsData } from '../data/add-question-bank-collection-questions';
import { clearQuestionBankCollectionQuestionsData } from '../data/clear-question-bank-collection-questions';
import { getQuestionBankCollectionQuestionLinksData } from '../data/get-question-bank-collection-question-links';
import { buildReorderedQuestionBankCollectionQuestionLinkValues } from './build-question-bank-collection-question-link-values.service';
import { getQuestionBankCollectionOrThrow } from './assert-question-bank-collection.service';
import { getQuestionBankCollectionByIdService } from './get-question-bank-collection-by-id.service';

export type RemoveQuestionsFromCollectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    questionIds: string[];
    userId: string;
    institutionId?: string;
};

/**
 * Removes specific questions from a collection and clears any linked exam questions.
 * Re-orders remaining questions to preserve a consistent order_index.
 */
export async function removeQuestionsFromCollectionService({
    dbClient,
    id,
    questionIds,
    userId,
    institutionId,
}: RemoveQuestionsFromCollectionServiceArgs) {
    await getQuestionBankCollectionOrThrow({
        dbClient,
        id,
        institutionId,
        userId,
    });

    await executeTransaction(async (trx) => {
        const existingLinks = await getQuestionBankCollectionQuestionLinksData({
            dbClient: trx,
            collectionId: id,
        });

        const questionIdSet = new Set(questionIds);
        const remainingLinks = existingLinks.filter(
            (item) => !questionIdSet.has(item.question_bank_question_id),
        );

        await clearQuestionBankCollectionQuestionsData({
            dbClient: trx,
            collectionId: id,
        });

        if (remainingLinks.length > 0) {
            await addQuestionBankCollectionQuestionsData({
                dbClient: trx,
                values: buildReorderedQuestionBankCollectionQuestionLinkValues(remainingLinks),
            });
        }

        await removeLinkedExamQuestionsBySourceQuestionIds({
            dbClient: trx,
            questionIds,
            sourceCollectionId: id,
        });
    });

    return await getQuestionBankCollectionByIdService({ dbClient, id, institutionId, userId });
}
