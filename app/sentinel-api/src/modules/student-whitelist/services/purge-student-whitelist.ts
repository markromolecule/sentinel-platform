import { type DbClient } from '@sentinel/db';
import { purgeStudentWhitelistData } from '../data/purge-student-whitelist';
import { resolveStudentWhitelistQueryScope } from '../helpers/resolve-student-whitelist-scope';
import { verifyRequesterPermissions } from '../helpers/verify-requester-permissions';
import type { PurgeStudentWhitelistArgs } from '../student-whitelist.types';

export async function purgeStudentWhitelist(
    dbClient: DbClient,
    {
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        values,
    }: PurgeStudentWhitelistArgs,
) {
    verifyRequesterPermissions({
        requesterRole,
        requesterInstitutionId,
    });

    const whitelistScope = resolveStudentWhitelistQueryScope({
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        queryInstitutionId: values.institution_id,
        departmentId: values.department_id,
        courseId: values.course_id,
    });

    return await purgeStudentWhitelistData({
        dbClient,
        institutionId: whitelistScope.institutionId,
        departmentId: whitelistScope.departmentId,
        courseId: whitelistScope.courseId,
        status: values.status,
        includeClaimed: values.include_claimed,
    });
}
