import { type DbClient } from '@sentinel/db';

export type GetInstitutionByIdDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function getInstitutionByIdData({ dbClient, id }: GetInstitutionByIdDataArgs) {
    const record = await dbClient
        .selectFrom('institutions as inst')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'inst.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'inst.updated_by')
        .select([
            'inst.id as institution_id',
            'inst.name',
            'inst.code',
            'inst.parent_institution_id',
            'inst.institution_kind',
            'inst.created_at',
            'inst.created_by',
            'inst.updated_at',
            'inst.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
        ])
        .where('inst.id', '=', id)
        .executeTakeFirst();

    return record;
}

export type GetInstitutionByIdDataResponse = Awaited<ReturnType<typeof getInstitutionByIdData>>;
