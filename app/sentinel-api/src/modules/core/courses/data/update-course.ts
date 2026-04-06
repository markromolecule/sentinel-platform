import { type DbClient } from '@sentinel/db';
import { type Updateable } from 'kysely';
import { type DB } from '@sentinel/db';

export type UpdateCourseDataArgs = {
    dbClient: DbClient;
    id: string;
    values: Updateable<DB['courses']>;
    institutionId?: string;
};

export async function updateCourseData({
    dbClient,
    id,
    values,
    institutionId,
}: UpdateCourseDataArgs) {
    let query = dbClient.updateTable('courses').set(values).where('course_id', '=', id);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    const record = await query.returningAll().executeTakeFirst();

    if (!record) {
        throw new Error('Course not found');
    }

    return record;
}

export type UpdateCourseDataResponse = Awaited<ReturnType<typeof updateCourseData>>;
