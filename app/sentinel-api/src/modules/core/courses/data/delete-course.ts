import { type DbClient } from '@sentinel/db';

export type DeleteCourseDataArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
};

export async function deleteCourseData({ dbClient, id, institutionId }: DeleteCourseDataArgs) {
    let query = dbClient.deleteFrom('courses').where('course_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const record = await query.returning('course_id').executeTakeFirst();

    if (!record) {
        throw new Error('Course not found');
    }

    return record;
}

export type DeleteCourseDataResponse = Awaited<ReturnType<typeof deleteCourseData>>;
