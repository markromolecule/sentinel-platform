import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetQuestionBankCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function getQuestionBankCollectionQuestionsData({
    dbClient,
    collectionId,
}: GetQuestionBankCollectionQuestionsDataArgs) {
    return await dbClient
        .selectFrom('question_bank_collection_questions as qbcq')
        .innerJoin(
            'question_bank_questions as qbq',
            'qbq.question_bank_question_id',
            'qbcq.question_bank_question_id',
        )
        .leftJoin('user_profiles as creator', 'creator.user_id', 'qbq.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'qbq.updated_by')
        .select([
            'qbq.question_bank_question_id',
            'qbq.subject_id',
            'qbq.institution_id',
            'qbq.question_type',
            'qbq.points',
            'qbq.tags',
            'qbq.content',
            'qbq.created_at',
            'qbq.updated_at',
            'qbq.created_by',
            'qbq.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            'qbcq.order_index',
            sql<string | null>`qbq.content->>'prompt'`.as('prompt'),
        ])
        .where('qbcq.collection_id', '=', collectionId)
        .where('qbq.archived_at', 'is', null)
        .orderBy('qbcq.order_index', 'asc')
        .execute();
}
