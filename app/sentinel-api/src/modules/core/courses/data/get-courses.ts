import { type DbClient } from '@sentinel/db';

export type GetCoursesDataArgs = {
    dbClient: DbClient;
    institutionId: string;
    departmentId?: string;
    courseId?: string;
    search?: string;
};

export async function getCoursesData({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    search,
}: GetCoursesDataArgs) {
    let query = dbClient
        .selectFrom('courses as c')
        .leftJoin('user_profiles as creator', 'creator.user_id', 'c.created_by')
        .leftJoin('user_profiles as updater', 'updater.user_id', 'c.updated_by')
        .leftJoin('departments as d', 'd.department_id', 'c.department_id')
        .select([
            'c.course_id',
            'c.code',
            'c.title',
            'c.department_id',
            'c.description',
            'c.created_at',
            'c.created_by',
            'c.updated_at',
            'c.updated_by',
            'creator.first_name as creator_first_name',
            'creator.last_name as creator_last_name',
            'updater.first_name as updater_first_name',
            'updater.last_name as updater_last_name',
            'd.department_name as department_name',
            'd.department_code as department_code',
        ] as any);

    if (institutionId) {
        query = query.where((eb) =>
            eb.or([eb('c.institution_id', '=', institutionId), eb('c.institution_id', 'is', null)]),
        );
    }

    if (departmentId) {
        query = query.where('c.department_id', '=', departmentId);
    }

    if (courseId) {
        query = query.where('c.course_id', '=', courseId);
    }

    if (search) {
        query = query.where((eb) =>
            eb.or([eb('c.title', 'ilike', `%${search}%`), eb('c.code', 'ilike', `%${search}%`)]),
        );
    }

    const records = await query.orderBy('c.title', 'asc').execute();

    return records;
}

export type GetCoursesDataResponse = Awaited<ReturnType<typeof getCoursesData>>;
