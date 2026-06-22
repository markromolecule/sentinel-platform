import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions';
import { archiveQuestionsData } from '../../question/data/archive-questions';
import { deleteQuestionBankCollectionData } from '../data/delete-question-bank-collection';
import { getQuestionBankCollectionQuestionLinksData } from '../data/get-question-bank-collection-question-links';

export type DeleteQuestionBankCollectionServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

/**
 * Deletes a question bank collection and archives any orphaned questions.
 * Also removes linked exam questions for all questions that were part of the collection.
 * Throws a 404 HTTPException if the collection does not exist.
 */
export async function deleteQuestionBankCollectionService({
    dbClient,
    id,
    institutionId,
}: DeleteQuestionBankCollectionServiceArgs) {
    const deleted = await executeTransaction(async (trx) => {
        const existingLinks = await getQuestionBankCollectionQuestionLinksData({
            dbClient: trx,
            collectionId: id,
        });

        const deletedCollection = await deleteQuestionBankCollectionData({
            dbClient: trx,
            id,
            institutionId,
        });

        if (!deletedCollection) {
            return null;
        }

        const linkedQuestionIds = existingLinks.map((link) => link.question_bank_question_id);

        if (linkedQuestionIds.length > 0) {
            await removeLinkedExamQuestionsBySourceQuestionIds({
                dbClient: trx,
                questionIds: linkedQuestionIds,
                sourceCollectionId: id,
            });

            const remainingLinks = (await trx
                .selectFrom('question_bank_collection_questions')
                .select('question_bank_question_id')
                .where('question_bank_question_id', 'in', linkedQuestionIds)
                .execute()) as { question_bank_question_id: string }[];

            const remainingQuestionIds = new Set(
                remainingLinks.map((link) => link.question_bank_question_id),
            );
            const orphanQuestionIds = linkedQuestionIds.filter(
                (questionId) => !remainingQuestionIds.has(questionId),
            );

            await archiveQuestionsData({
                dbClient: trx,
                ids: orphanQuestionIds,
                institutionId,
                archivedAt: new Date(),
            });
        }

        return deletedCollection;
    });

    if (!deleted) {
        throw new HTTPException(404, {
            message: 'Collection not found.',
        });
    }
}
