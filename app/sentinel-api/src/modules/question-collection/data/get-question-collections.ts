import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { GetQuestionCollectionsQuery } from '../question-collection.dto';

export type GetQuestionCollectionsDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    filters: GetQuestionCollectionsQuery;
};

export async function getQuestionCollectionsData({
    dbClient,
    institutionId,
    filters,
}: GetQuestionCollectionsDataArgs) {
    let query = dbClient
        .selectFrom('question_bank_collections as qc')
        .leftJoin(
            'question_bank_collection_questions as qcq',
            'qcq.collection_id',
            'qc.collection_id',
        )
        .leftJoin('user_profiles as creator', 'creator.user_id', 'qc.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'qc.updated_by')
        .select([
            'qc.collection_id',
            'qc.institution_id',
            'qc.name',
            'qc.description',
            'qc.tags',
            'qc.is_public',
            'qc.created_at',
            'qc.updated_at',
            'qc.created_by',
            'qc.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            sql<number>`count(qcq.question_bank_question_id)::int`.as('question_count'),
        ])
        .groupBy([
            'qc.collection_id',
            'creator.first_name',
            'creator.last_name',
            'updater.first_name',
            'updater.last_name',
        ]);

    if (institutionId) {
        query = query.where('qc.institution_id', '=', institutionId);
    }

    if (filters.search) {
        query = query.where((eb) =>
            eb.or([
                eb('qc.name', 'ilike', `%${filters.search}%`),
                eb('qc.description', 'ilike', `%${filters.search}%`),
            ]),
        );
    }

    return await query.orderBy('qc.updated_at', 'desc').execute();
}
