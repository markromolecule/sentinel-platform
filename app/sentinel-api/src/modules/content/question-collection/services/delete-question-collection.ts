import { HTTPException } from 'hono/http-exception';
import { type DbClient, executeTransaction } from '@sentinel/db';
import { archiveQuestionsData } from '@/modules/content/question/data/archive-questions';
import { deleteQuestionCollectionData } from '../data/delete-question-collection';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';

export async function deleteQuestionCollection(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
}) {
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
