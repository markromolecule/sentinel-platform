import { type DbClient } from '@sentinel/db';
import { getStudentWhitelistData } from '../data/get-student-whitelist';
import { resolveStudentWhitelistQueryScope } from '../helpers/resolve-student-whitelist-scope';
import { verifyRequesterPermissions } from '../helpers/verify-requester-permissions';
import type { GetStudentWhitelistArgs } from '../student-whitelist.types';

export async function getStudentWhitelist(
    dbClient: DbClient,
    {
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
        queryInstitutionId,
        departmentId,
        courseId,
        status,
        search,
    }: GetStudentWhitelistArgs,
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
        queryInstitutionId,
        departmentId,
        courseId,
    });

    return await getStudentWhitelistData({
        dbClient,
        institutionId: whitelistScope.institutionId,
        departmentId: whitelistScope.departmentId,
        courseId: whitelistScope.courseId,
        status,
        search,
    });
}
