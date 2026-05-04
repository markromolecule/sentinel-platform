import { type DbClient } from '@sentinel/db';

export type GetInstitutionsDataArgs = {
    dbClient: DbClient;
    search?: string;
    parentInstitutionId?: string;
    institutionKind?: 'STANDALONE' | 'PARENT' | 'CHILD';
};

export async function getInstitutionsData({
    dbClient,
    search,
    parentInstitutionId,
    institutionKind,
}: GetInstitutionsDataArgs) {
    let query = dbClient
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
        ]);

    if (parentInstitutionId) {
        query = query.where('inst.parent_institution_id', '=', parentInstitutionId);
    }

    if (institutionKind) {
        query = query.where('inst.institution_kind', '=', institutionKind);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([
                eb('inst.name', 'ilike', `%${search}%`),
                eb('inst.code', 'ilike', `%${search}%`),
            ]),
        );
    }

    const records = await query.orderBy('inst.name', 'asc').execute();

    return records;
}

export type GetInstitutionsDataResponse = Awaited<ReturnType<typeof getInstitutionsData>>;
