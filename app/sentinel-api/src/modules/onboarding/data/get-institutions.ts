import { DbClient } from '@sentinel/db';

export type GetInstitutionsDataArgs = {
    dbClient: DbClient;
};

export async function getInstitutionsData({ dbClient }: GetInstitutionsDataArgs) {
    const institutions = await dbClient
        .selectFrom('institutions')
        .selectAll()
        .orderBy('name', 'asc')
        .execute();

    return institutions;
}

export type GetInstitutionsDataResponse = Awaited<ReturnType<typeof getInstitutionsData>>;
