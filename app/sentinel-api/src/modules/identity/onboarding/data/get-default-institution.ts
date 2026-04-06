import { type DB, DbClient } from '@sentinel/db';
import { type Selectable } from 'kysely';

export type GetDefaultInstitutionDataArgs = {
    dbClient: DbClient;
};

export async function getDefaultInstitutionData({
    dbClient,
}: GetDefaultInstitutionDataArgs): Promise<Selectable<DB['institutions']> | undefined> {
    const institution = await dbClient
        .selectFrom('institutions')
        .selectAll()
        .where('name', '=', 'NU DASMARIÑAS')
        .executeTakeFirst();

    return institution;
}

export type GetDefaultInstitutionDataResponse = Awaited<
    ReturnType<typeof getDefaultInstitutionData>
>;
