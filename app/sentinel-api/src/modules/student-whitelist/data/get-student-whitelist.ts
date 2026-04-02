import { type DbClient } from '@sentinel/db';
import { buildStudentWhitelistQuery } from './build-student-whitelist-query';

export type GetStudentWhitelistDataArgs = {
    dbClient: DbClient;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    search?: string;
};

export async function getStudentWhitelistData({
    dbClient,
    institutionId,
    departmentId,
    courseId,
    status,
    search,
}: GetStudentWhitelistDataArgs) {
    let query = buildStudentWhitelistQuery(dbClient);

    if (institutionId) {
        query = query.where('sw.institution_id', '=', institutionId);
    }

    if (departmentId) {
        query = query.where('sw.department_id', '=', departmentId);
    }

    if (courseId) {
        query = query.where('sw.course_id', '=', courseId);
    }

    if (status) {
        query = query.where('sw.status', '=', status);
    }

    const normalizedSearch = search?.trim();

    if (normalizedSearch) {
        query = query.where((eb) =>
            eb.or([
                eb('sw.student_number', 'ilike', `%${normalizedSearch}%`),
                eb('sw.first_name', 'ilike', `%${normalizedSearch}%`),
                eb('sw.last_name', 'ilike', `%${normalizedSearch}%`),
                eb('course.code', 'ilike', `%${normalizedSearch}%`),
                eb('dept.department_code', 'ilike', `%${normalizedSearch}%`),
            ]),
        );
    }

    return await query.orderBy('sw.last_name', 'asc').orderBy('sw.first_name', 'asc').execute();
}
