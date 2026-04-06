import { type DbClient } from '@sentinel/db';

export type GetSemesterStateDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function getSemesterStateData({ dbClient, id }: GetSemesterStateDataArgs) {
    return await dbClient
        .selectFrom('terms')
        .select(['institution_id', 'is_active'])
        .where('term_id', '=', id)
        .executeTakeFirstOrThrow();
}

export type GetSemesterStateDataResponse = Awaited<ReturnType<typeof getSemesterStateData>>;
