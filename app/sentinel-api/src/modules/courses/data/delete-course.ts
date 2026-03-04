import { type DbClient } from '@/lib/create-db-client';

export type DeleteCourseDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteCourseData({ dbClient, id }: DeleteCourseDataArgs) {
    const record = await dbClient
        .deleteFrom('courses')
        .where('course_id', '=', id)
        .returning('course_id')
        .executeTakeFirst();

    if (!record) {
        throw new Error('Course not found');
    }

    return record;
}

export type DeleteCourseDataResponse = Awaited<ReturnType<typeof deleteCourseData>>;
