import { type DbClient } from '@sentinel/db';
import { getQuestionBankCollectionQuestionLinksData } from '../data/get-question-bank-collection-question-links';
import { getQuestionBankCollectionQuestionsData } from '../data/get-question-bank-collection-questions';
import { mapQuestionBankCollectionDetailResponse } from './map-question-bank-collection-response.service';
import { getQuestionBankCollectionOrThrow } from './assert-question-bank-collection.service';
import { mapQuestionResponse } from '../../question/services/map-question-response';

export async function getQuestionBankCollectionDetailOrThrow(args: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    userId: string;
}) {
    const record = await getQuestionBankCollectionOrThrow(args);
    const [questionLinks, questionRecords] = await Promise.all([
        getQuestionBankCollectionQuestionLinksData({
            dbClient: args.dbClient,
            collectionId: args.id,
        }),
        getQuestionBankCollectionQuestionsData({
            dbClient: args.dbClient,
            collectionId: args.id,
        }),
    ]);

    return mapQuestionBankCollectionDetailResponse({
        record,
        questionIds: questionLinks.map((item) => item.question_bank_question_id),
        questions: questionRecords.map(mapQuestionResponse),
    });
}
