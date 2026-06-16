import { type DbClient } from '@sentinel/db';

export type GetQuestionBankCollectionByIdDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    userId: string;
};

export async function getQuestionBankCollectionByIdData({
    dbClient,
    id,
    institutionId,
    userId,
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

    query = query.where((eb) =>
        eb.or([
            eb('qbc.is_public', '=', true),
            eb('qbc.created_by', '=', userId),
            eb.exists(
                eb
                    .selectFrom('question_bank_collection_shares as qcs')
                    .select('qcs.user_id')
                    .whereRef('qcs.collection_id', '=', 'qbc.collection_id')
                    .where('qcs.user_id', '=', userId),
            ),
        ]),
    );

    return await query.executeTakeFirst();
}
