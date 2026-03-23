import { type DB, DbClient } from '@sentinel/db';
import { type Selectable } from 'kysely';

export type GetInstitutionsDataArgs = {
    dbClient: DbClient;
};

export async function getInstitutionsData({
    dbClient,
}: GetInstitutionsDataArgs): Promise<Selectable<DB['institutions']>[]> {
    const institutions = await dbClient
        .selectFrom('institutions')
        .selectAll()
        .orderBy('name', 'asc')
        .execute();

    return institutions;
}

export type GetInstitutionsDataResponse = Awaited<ReturnType<typeof getInstitutionsData>>;
