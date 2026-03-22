import { DbClient } from '@sentinel/db';

export type GetCoursesDataArgs = {
    dbClient: DbClient;
    departmentId?: string;
    institutionId?: string;
};

export async function getCoursesData({ dbClient, departmentId, institutionId }: GetCoursesDataArgs) {
    let query = dbClient.selectFrom('courses').selectAll().orderBy('title', 'asc');

    if (departmentId) {
        query = query.where('department_id', '=', departmentId);
    }

    if (institutionId) {
        query = query.where('institution_id', '=', institutionId);
    }

    const courses = await query.execute();

    return courses;
}

export type GetCoursesDataResponse = Awaited<ReturnType<typeof getCoursesData>>;
