import { type DbClient } from '@/lib/create-db-client';

export type GetCourseByCodeDataArgs = {
    dbClient: DbClient;
    code: string;
};

export async function getCourseByCodeData({ dbClient, code }: GetCourseByCodeDataArgs) {
    const record = await dbClient
        .selectFrom('courses')
        .where('code', '=', code)
        .selectAll()
        .executeTakeFirst();

    return record;
}

export type GetCourseByCodeDataResponse = Awaited<ReturnType<typeof getCourseByCodeData>>;
