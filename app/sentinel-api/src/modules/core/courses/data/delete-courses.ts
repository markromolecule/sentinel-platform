import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

export type DeleteCoursesDataArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
};

export async function deleteCoursesData({ dbClient, ids, institutionId }: DeleteCoursesDataArgs) {
    if (!ids || ids.length === 0) {
        throw new HTTPException(400, { message: 'No course IDs provided' });
    }

    let query = dbClient.deleteFrom('courses').where('course_id', 'in', ids);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
        );
    }

    // execute() handles the bulk deletion and returns all affected records
    const deletedRecords = await query.returning('course_id').execute();

    if (deletedRecords.length === 0) {
        throw new HTTPException(404, { message: 'Courses not found or already deleted' });
    }

    return deletedRecords;
}
