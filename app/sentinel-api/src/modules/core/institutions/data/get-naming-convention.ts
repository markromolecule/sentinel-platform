import { type DbClient } from '@sentinel/db';

export type GetNamingConventionDataArgs = {
    dbClient: DbClient;
    institutionId: string;
};

export async function getNamingConventionData({
    dbClient,
    institutionId,
}: GetNamingConventionDataArgs) {
    return await dbClient
        .selectFrom('institution_naming_conventions')
        .selectAll()
        .where('institution_id', '=', institutionId)
        .executeTakeFirst();
}

export type GetNamingConventionDataResponse = Awaited<
    ReturnType<typeof getNamingConventionData>
>;
