import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions';
import { addQuestionCollectionQuestionsData } from '../data/add-question-collection-questions';
import { clearQuestionCollectionQuestionsData } from '../data/clear-question-collection-questions';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { getQuestionCollectionOrThrow } from './assert-question-collection.service';
import { assertCollectionAccess } from './assert-question-collection-access';
import { buildReorderedQuestionCollectionQuestionLinkValues } from './build-question-collection-question-link-values.service';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail.service';

/**
 * Removes questions from a collection after checking edit permissions.
 */
export async function removeQuestionsFromCollection(args: {
    dbClient: DbClient;
    id: string;
    questionIds: string[];
    userId: string;
    institutionId?: string;
}) {
    await assertCollectionAccess({
        dbClient: args.dbClient,
        collectionId: args.id,
        userId: args.userId,
        action: 'edit',
    });

    await getQuestionCollectionOrThrow({
        dbClient: args.dbClient,
        id: args.id,
        institutionId: args.institutionId,
    });

    await executeTransaction(async (trx) => {
        const existingLinks = await getQuestionCollectionQuestionLinksData({
            dbClient: trx,
            collectionId: args.id,
        });

        const questionIdSet = new Set(args.questionIds);
        const remainingLinks = existingLinks.filter(
            (item) => !questionIdSet.has(item.question_bank_question_id),
        );

        await clearQuestionCollectionQuestionsData({
            dbClient: trx,
            collectionId: args.id,
        });

        if (remainingLinks.length > 0) {
            await addQuestionCollectionQuestionsData({
                dbClient: trx,
                values: buildReorderedQuestionCollectionQuestionLinkValues(remainingLinks),
            });
        }

        await removeLinkedExamQuestionsBySourceQuestionIds({
            dbClient: trx,
            questionIds: args.questionIds,
            sourceCollectionId: args.id,
        });
    });

    return await getQuestionCollectionDetailOrThrow({
        dbClient: args.dbClient,
        id: args.id,
        userId: args.userId,
        institutionId: args.institutionId,
    });
}
