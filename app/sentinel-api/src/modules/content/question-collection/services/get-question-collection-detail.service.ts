import { type DbClient } from '@sentinel/db';
import { getQuestionCollectionQuestionLinksData } from '../data/get-question-collection-question-links';
import { getQuestionCollectionQuestionsData } from '../data/get-question-collection-questions';
import { getQuestionCollectionOrThrow } from './assert-question-collection.service';
import { mapQuestionCollectionDetailResponse } from './map-question-collection-response.service';
import { mapQuestionResponse } from '../../question/services/map-question-response';

export async function getQuestionCollectionDetailOrThrow(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
}) {
    const record = await getQuestionCollectionOrThrow(args);
    const [questionLinks, questionRecords] = await Promise.all([
        getQuestionCollectionQuestionLinksData({
            dbClient: args.dbClient,
            collectionId: args.id,
        }),
        getQuestionCollectionQuestionsData({
            dbClient: args.dbClient,
            collectionId: args.id,
        }),
    ]);

    return mapQuestionCollectionDetailResponse({
        record,
        questionIds: questionLinks.map((item) => item.question_bank_question_id),
        questions: questionRecords.map(mapQuestionResponse),
    });
}
