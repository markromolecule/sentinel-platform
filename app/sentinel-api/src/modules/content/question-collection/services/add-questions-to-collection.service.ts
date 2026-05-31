import { type DbClient } from '@sentinel/db';
import { addQuestionCollectionQuestionsData } from '../data/add-question-collection-questions';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { getQuestionCollectionOrThrow } from './assert-question-collection.service';
import { buildQuestionCollectionQuestionLinkValues } from './build-question-collection-question-link-values.service';
import { getQuestionCollectionDetailOrThrow } from './get-question-collection-detail.service';
import { LogsService } from '../../../general/logs/logs.service';

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
        const instId =
            args.institutionId ||
            (
                await args.dbClient
                    .selectFrom('question_bank_collections')
                    .select(['institution_id'])
                    .where('collection_id', '=', args.id)
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
