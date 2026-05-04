import { type DbClient } from '@sentinel/db';

export type GetInstitutionKindDataArgs = {
    dbClient: DbClient;
    institutionId: string;
};

export async function getInstitutionKindData({
    dbClient,
    institutionId,
}: GetInstitutionKindDataArgs) {
    const institution = await dbClient
        .selectFrom('institutions')
        .select(['institution_kind', 'parent_institution_id'])
        .where('id', '=', institutionId)
        .executeTakeFirst();

    return institution ?? null;
}
