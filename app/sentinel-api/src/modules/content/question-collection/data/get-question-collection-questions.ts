import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetQuestionCollectionQuestionsDataArgs = {
    dbClient: DbClient;
    collectionId: string;
};

export async function getQuestionCollectionQuestionsData({
    dbClient,
    collectionId,
}: GetQuestionCollectionQuestionsDataArgs) {
    return await dbClient
        .selectFrom('question_bank_collection_questions as qcq')
        .innerJoin(
            'question_bank_questions as qbq',
            'qbq.question_bank_question_id',
            'qcq.question_bank_question_id',
        )
        .leftJoin('user_profiles as creator', 'creator.user_id', 'qbq.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'qbq.updated_by')
        .select([
            'qbq.question_bank_question_id',
            'qbq.subject_id',
            'qbq.institution_id',
            'qbq.source_origin',
            'qbq.source_file_name',
            'qbq.source_page_number',
            'qbq.source_evidence',
            'qbq.question_type',
            'qbq.difficulty',
            'qbq.points',
            'qbq.tags',
            'qbq.content',
            'qbq.passage_content',
            'qbq.passage_type',
            'qbq.created_at',
            'qbq.updated_at',
            'qbq.created_by',
            'qbq.updated_by',
            'qbq.status',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            'qcq.order_index',
            sql<string | null>`qbq.content->>'prompt'`.as('prompt'),
        ])
        .where('qcq.collection_id', '=', collectionId)
        .where('qbq.archived_at', 'is', null)
        .orderBy('qcq.order_index', 'asc')
        .execute();
}
