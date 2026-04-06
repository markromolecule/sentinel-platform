import { type DbClient } from '@sentinel/db';
import { addQuestionCollectionQuestionsData } from '../data/add-question-collection-questions';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { getQuestionCollectionOrThrow } from './assert-question-collection';
import { buildQuestionCollectionQuestionLinkValues } from './build-question-collection-question-link-values';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail';

export async function addQuestionsToCollection(args: {
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

    const existingLinks = await getQuestionCollectionQuestionLinksData({
        dbClient: args.dbClient,
        collectionId: args.id,
    });
    const existingIds = new Set(existingLinks.map((item) => item.question_bank_question_id));
    const nextOrderIndex = existingLinks.length;
    const newQuestionIds = args.questionIds.filter((questionId) => !existingIds.has(questionId));

    await addQuestionCollectionQuestionsData({
        dbClient: args.dbClient,
        values: buildQuestionCollectionQuestionLinkValues({
            collectionId: args.id,
            questionIds: newQuestionIds,
            startOrderIndex: nextOrderIndex,
        }),
    });

    return await getQuestionCollectionDetailOrThrow({
        dbClient: args.dbClient,
        id: args.id,
        institutionId: args.institutionId,
    });
}
