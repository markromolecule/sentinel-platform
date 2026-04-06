import { type DbClient } from '@sentinel/db';
import { buildStudentWhitelistQuery } from './build-student-whitelist-query';

export async function getStudentWhitelistByIdData({
    dbClient,
    id,
    institutionId,
    departmentId,
    courseId,
}: {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    departmentId?: string;
    courseId?: string;
}) {
    let query = buildStudentWhitelistQuery(dbClient).where('sw.whitelist_id', '=', id);

    if (institutionId) {
        query = query.where('sw.institution_id', '=', institutionId);
    }

    if (departmentId) {
        query = query.where('sw.department_id', '=', departmentId);
    }

    if (courseId) {
        query = query.where('sw.course_id', '=', courseId);
    }

    return await query.executeTakeFirst();
}
