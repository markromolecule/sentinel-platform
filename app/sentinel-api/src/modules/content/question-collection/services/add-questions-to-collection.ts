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

    // Telemetry logging
    try {
        const { LogsService } = await import('../../../general/logs/logs.service');
        const instId =
            args.institutionId ||
            (
                await args.dbClient
                    .selectFrom('question_collections')
                    .select(['institution_id'])
                    .where('question_collection_id', '=', args.id)
                    .executeTakeFirst()
            )?.institution_id;
        if (instId) {
            await LogsService.createLog(args.dbClient, {
                userId: '00000000-0000-0000-0000-000000000000',
                action: 'collection.questions_added',
                resourceType: 'question_collection',
                resourceId: args.id,
                activeInstitutionId: instId,
                details: {
                    collectionId: args.id,
                    questionIds: args.questionIds,
                    newQuestionIds,
                },
            });
        }
    } catch (logErr) {
        console.error('Failed to log collection.questions_added:', logErr);
    }

    return await getQuestionCollectionDetailOrThrow({
        dbClient: args.dbClient,
        id: args.id,
        institutionId: args.institutionId,
    });
}
