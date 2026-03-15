import { type DbClient } from '@sentinel/db';

export type GetInstitutionsDataArgs = {
    dbClient: DbClient;
};

export async function getInstitutionsData({ dbClient }: GetInstitutionsDataArgs) {
    const records = await dbClient
        .selectFrom('institutions as inst')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'inst.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'inst.updated_by')
        .select([
            'inst.id as institution_id',
            'inst.name',
            'inst.code',
            'inst.created_at',
            'inst.created_by',
            'inst.updated_at',
            'inst.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ])
        .orderBy('inst.name', 'asc')
        .execute();

    return records;
}

export type GetInstitutionsDataResponse = Awaited<ReturnType<typeof getInstitutionsData>>;
