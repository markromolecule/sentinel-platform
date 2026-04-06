import { type DbClient } from '@sentinel/db';
import { forbidden } from './errors';
import { isAdminScope } from './helpers';
import { assertUserCourseAssignmentInScope } from './user-assertions';
import type { RequesterAcademicScope, ScopedUserMutationOptions } from './types';

function resolveRequestedCourseIds<
    T extends { role?: string; course?: string; courseIds?: string[] },
>(values: T) {
    const requestedCourseIds =
        values.role === 'instructor'
            ? values.courseIds?.length
                ? values.courseIds
                : values.course
                  ? [values.course]
                  : []
            : values.course
              ? [values.course]
              : [];

    return Array.from(new Set(requestedCourseIds.filter(Boolean)));
}

export async function resolveScopedUserMutationValues<
    T extends {
        role?: string;
        institution?: string | null;
        department?: string;
        course?: string;
        courseIds?: string[];
    },
>(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    values: T,
    options?: ScopedUserMutationOptions,
) {
    const nextValues: T = {
        ...values,
    };

    if (scope.requesterRole !== 'support' && (scope.requesterInstitutionId || '').trim() !== '') {
        nextValues.institution = scope.requesterInstitutionId;
    }

    if (scope.requesterDepartmentId) {
        if (
            values.department &&
            values.department !== '' &&
            values.department !== scope.requesterDepartmentId
        ) {
            forbidden('Forbidden: Cannot manage users outside your department');
        }

        nextValues.department = scope.requesterDepartmentId;
    }

    const shouldForceAdminCourse = isAdminScope(scope) && options?.forceAdminCourse !== false;
    const requestedCourseIds = resolveRequestedCourseIds(nextValues);

    if (shouldForceAdminCourse && scope.requesterCourseId) {
        nextValues.course = scope.requesterCourseId;
        nextValues.courseIds = nextValues.role === 'instructor' ? [scope.requesterCourseId] : [];

        await assertUserCourseAssignmentInScope(dbClient, scope, scope.requesterCourseId);
        return nextValues;
    }

    for (const courseId of requestedCourseIds) {
        await assertUserCourseAssignmentInScope(dbClient, scope, courseId);
    }

    return nextValues;
}
