import { type DbClient } from '@sentinel/db';

export type GetQuestionCollectionByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getQuestionCollectionByIdData({
    dbClient,
    id,
    institutionId,
}: GetQuestionCollectionByIdDataArgs) {
    let query = dbClient
        .selectFrom('question_bank_collections as qc')
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
        ])
        .where('qc.collection_id', '=', id);

    if (institutionId) {
        query = query.where('qc.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
