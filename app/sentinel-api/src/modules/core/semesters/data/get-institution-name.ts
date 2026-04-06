import { type DbClient } from '@sentinel/db';

export type GetInstitutionNameDataArgs = {
    dbClient: DbClient;
    institutionId?: string | null;
};

export async function getInstitutionNameData({
    dbClient,
    institutionId,
}: GetInstitutionNameDataArgs) {
    if (!institutionId) {
        return null;
    }

    const institution = await dbClient
        .selectFrom('institutions')
        .select('name')
        .where('id', '=', institutionId)
        .executeTakeFirst();

    return institution?.name ?? null;
}
