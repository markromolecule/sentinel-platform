import { type DbClient } from '@/lib/create-db-client';
import { type Updateable } from 'kysely';
import { type DB } from '@/lib/types';

export type UpdateCourseDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['courses']>;
};

export async function updateCourseData({ dbClient, id, values }: UpdateCourseDataArgs) {
    const record = await dbClient
        .updateTable('courses')
        .set(values)
        .where('course_id', '=', id)
        .returningAll()
        .executeTakeFirst();

    if (!record) {
        throw new Error('Course not found');
    }

    return record;
}

export type UpdateCourseDataResponse = Awaited<ReturnType<typeof updateCourseData>>;
