import { type DbClient } from '@sentinel/db';

export type GetQuestionBankCollectionByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function getQuestionBankCollectionByIdData({
    dbClient,
    id,
    institutionId,
}: GetQuestionBankCollectionByIdDataArgs) {
    let query = dbClient
        .selectFrom('question_bank_collections as qbc')
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
        ])
        .where('qbc.collection_id', '=', id);

    if (institutionId) {
        query = query.where('qbc.institution_id', '=', institutionId);
    }

    return await query.executeTakeFirst();
}
