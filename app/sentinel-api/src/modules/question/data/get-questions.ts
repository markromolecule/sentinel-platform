import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionsQuery } from '../question.dto';

export type GetQuestionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetQuestionsQuery;
};

export async function getQuestionsData({
    dbClient,
    institutionId,
    filters,
}: GetQuestionsDataArgs) {
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
        .where('qbq.archived_at', 'is', null);

    if (institutionId) {
        query = query.where('qbq.institution_id', '=', institutionId);
    }

    if (filters.subjectId) {
        query = query.where('qbq.subject_id', '=', filters.subjectId);
    }

    if (filters.type) {
        query = query.where('qbq.question_type', '=', filters.type);
    }

    if (filters.search) {
        query = query.where(sql<boolean>`qbq.content->>'prompt' ilike ${`%${filters.search}%`}`);
    }

    return await query.orderBy('qbq.updated_at', 'desc').execute();
}
