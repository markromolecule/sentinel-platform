import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';

export type GetQuestionByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getQuestionByIdData({
    dbClient,
    id,
    institutionId,
}: GetQuestionByIdDataArgs) {
    let query = dbClient
        .selectFrom('question_bank_questions as qbq')
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
            sql<string | null>`qbq.content->>'prompt'`.as('prompt'),
        ])
        .where('qbq.question_bank_question_id', '=', id)
        .where('qbq.archived_at', 'is', null);

    if (institutionId) {
        query = query.where('qbq.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
