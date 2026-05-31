import { type DbClient, executeTransaction } from '@sentinel/db';
import { removeLinkedExamQuestionsBySourceQuestionIds } from '../../../examination/exams/services/remove-linked-exam-questions';
import { addQuestionCollectionQuestionsData } from '../data/add-question-collection-questions';
import { clearQuestionCollectionQuestionsData } from '../data/clear-question-collection-questions';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { getQuestionCollectionOrThrow } from './assert-question-collection.service';
import { buildReorderedQuestionCollectionQuestionLinkValues } from './build-question-collection-question-link-values.service';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail.service';

export async function removeQuestionsFromCollection(args: {
    dbClient: DbClient;
    id: string;
    questionIds: string[];
    institutionId?: string;
}) {
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
        institutionId: args.institutionId,
    });
}
