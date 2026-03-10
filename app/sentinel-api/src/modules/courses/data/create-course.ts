import { type DbClient } from '@sentinel/db';
import { type Insertable } from 'kysely';
import { type DB } from '@sentinel/db';

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
