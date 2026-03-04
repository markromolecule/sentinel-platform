import { type DbClient } from '@/lib/create-db-client';

export type GetCoursesDataArgs = {
    dbClient: DbClient;
};

export async function getCoursesData({ dbClient }: GetCoursesDataArgs) {
    const records = await dbClient
        .selectFrom('courses')
        .selectAll()
        .orderBy('title', 'asc')
        .execute();

    return records;
}

export type GetCoursesDataResponse = Awaited<ReturnType<typeof getCoursesData>>;
