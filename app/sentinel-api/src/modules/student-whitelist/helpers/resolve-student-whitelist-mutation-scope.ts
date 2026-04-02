import { resolveStudentWhitelistInstitutionId } from './resolve-student-whitelist-scope';
import { enforceAdminScope } from './enforce-admin-scope';
import { validateAcademicScope } from './validate-academic-scope';
import { verifyRequesterPermissions } from './verify-requester-permissions';
import type { StudentWhitelistMutationScopeArgs } from '../student-whitelist.types';

export async function resolveStudentWhitelistMutationScope({
    dbClient,
    requesterRole,
    requesterInstitutionId,
    requesterDepartmentId,
    requesterCourseId,
    requestedInstitutionId,
    departmentId,
    courseId,
}: StudentWhitelistMutationScopeArgs) {
    verifyRequesterPermissions({
        requesterRole,
        requesterInstitutionId,
    });

    const institutionId = resolveStudentWhitelistInstitutionId({
        requesterRole,
        requesterInstitutionId,
        requestedInstitutionId,
    });

    if (!institutionId) {
        throw new Error('Institution is required');
    }

    enforceAdminScope({
        requesterRole,
        requesterDepartmentId,
        requesterCourseId,
        departmentId,
        courseId,
    });

    await validateAcademicScope(dbClient, {
        institutionId,
        departmentId,
        courseId,
    });

    return {
        institutionId,
        departmentId,
        courseId,
    };
}
