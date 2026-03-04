import { type DbClient } from '@/lib/create-db-client';
import { type Insertable } from 'kysely';
import { type DB } from '@/lib/types';

export type CreateCourseDataArgs = {
    dbClient: DbClient;
    values: Insertable<DB['courses']>;
};

export async function createCourseData({ dbClient, values }: CreateCourseDataArgs) {
    const record = await dbClient
        .insertInto('courses')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();

    return record;
}

export type CreateCourseDataResponse = Awaited<ReturnType<typeof createCourseData>>;
