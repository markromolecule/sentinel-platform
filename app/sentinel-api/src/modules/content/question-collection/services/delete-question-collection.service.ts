import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions';
import { archiveQuestionsData } from '../../question/data/archive-questions';
import { deleteQuestionCollectionData } from '../data/delete-question-collection';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { assertCollectionAccess } from './assert-question-collection-access';

/**
 * Deletes a question collection after checking creator-only access.
 */
export async function deleteQuestionCollection(args: {
    dbClient: DbClient;
    id: string;
    userId: string;
    institutionId?: string;
}) {
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'delete',
    });

    const deleted = await executeTransaction(async (trx) => {
        const existingLinks = await getQuestionCollectionQuestionLinksData({
            dbClient: trx,
            collectionId: args.id,
        });

        const deletedCollection = await deleteQuestionCollectionData({
            dbClient: trx,
            id: args.id,
            institutionId: args.institutionId,
        });

        if (!deletedCollection) {
            return null;
        }

        const linkedQuestionIds = existingLinks.map((link) => link.question_bank_question_id);

        if (linkedQuestionIds.length > 0) {
            await removeLinkedExamQuestionsBySourceQuestionIds({
                dbClient: trx,
                questionIds: linkedQuestionIds,
                sourceCollectionId: args.id,
            });

            const remainingLinks = await trx
                .selectFrom('question_bank_collection_questions')
                .select('question_bank_question_id')
                .where('question_bank_question_id', 'in', linkedQuestionIds)
                .execute();

            const remainingQuestionIds = new Set(
                remainingLinks.map((link) => link.question_bank_question_id),
            );
            const orphanQuestionIds = linkedQuestionIds.filter(
                (questionId) => !remainingQuestionIds.has(questionId),
            );

            await archiveQuestionsData({
                dbClient: trx,
                ids: orphanQuestionIds,
                institutionId: args.institutionId,
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
