import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionBankCollectionsQuery } from '../question-bank.dto';

export type GetQuestionBankCollectionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetQuestionBankCollectionsQuery;
};

export async function getQuestionBankCollectionsData({
    dbClient,
    institutionId,
    filters,
}: GetQuestionBankCollectionsDataArgs) {
    let query = dbClient
        .selectFrom('question_bank_collections as qbc')
        .leftJoin('question_bank_collection_questions as qbcq', 'qbcq.collection_id', 'qbc.collection_id')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'qbc.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'qbc.updated_by')
        .select([
            'qbc.collection_id',
            'qbc.institution_id',
            'qbc.name',
            'qbc.description',
            'qbc.tags',
            'qbc.is_public',
            'qbc.created_at',
            'qbc.updated_at',
            'qbc.created_by',
            'qbc.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            sql<number>`count(qbcq.question_bank_question_id)`.as('question_count'),
        ])
        .groupBy([
            'qbc.collection_id',
            'creator.first_name',
            'creator.last_name',
            'updater.first_name',
            'updater.last_name',
        ]);

    if (institutionId) {
        query = query.where('qbc.institution_id', '=', institutionId);
    }

    if (filters.search) {
        query = query.where((eb) =>
            eb.or([
                eb('qbc.name', 'ilike', `%${filters.search}%`),
                eb('qbc.description', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    return await query.orderBy('qbc.updated_at', 'desc').execute();
}
