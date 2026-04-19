import { isAdminScope, isSuperadminScope, isSupportScope } from './helpers';
import type { AcademicQueryScopeArgs, RequesterAcademicScope } from './types';

export function buildRequesterAcademicScope(args: RequesterAcademicScope): RequesterAcademicScope {
    return {
        requesterRole: args.requesterRole,
        requesterInstitutionId: args.requesterInstitutionId,
        requesterDepartmentId: args.requesterDepartmentId ?? null,
        requesterCourseId: args.requesterCourseId ?? null,
    };
}

export function resolveAcademicQueryScope(
    scope: RequesterAcademicScope,
    args?: AcademicQueryScopeArgs,
) {
    const requestedInstitutionId = args?.requestedInstitutionId;
    const requestedDepartmentId = args?.departmentId;
    const requestedCourseId = args?.courseId;

    const institutionId = isSupportScope(scope)
        ? requestedInstitutionId
        : isSuperadminScope(scope)
          ? requestedInstitutionId || scope.requesterInstitutionId
          : scope.requesterInstitutionId;

    const departmentId =
        isSupportScope(scope) || isSuperadminScope(scope)
            ? requestedDepartmentId
            : (scope.requesterDepartmentId ?? requestedDepartmentId);

    const courseId =
        isSupportScope(scope) || isSuperadminScope(scope)
            ? requestedCourseId
            : isAdminScope(scope)
              ? (scope.requesterCourseId ?? requestedCourseId)
              : requestedCourseId;

    return {
        institutionId,
        departmentId,
        courseId,
    };
}
