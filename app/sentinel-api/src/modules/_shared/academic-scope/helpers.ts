import { forbidden } from './errors';
import type { RequesterAcademicScope } from './types';

export function isSupportScope(scope: RequesterAcademicScope) {
    return scope.requesterRole === 'support';
}

export function isSuperadminScope(scope: RequesterAcademicScope) {
    return scope.requesterRole === 'superadmin';
}

export function isAdminScope(scope: RequesterAcademicScope) {
    return scope.requesterRole === 'admin';
}

export function requireInstitutionId(
    scope: RequesterAcademicScope,
    message = 'Forbidden: No institution assigned to this account',
) {
    if (!scope.requesterInstitutionId) {
        forbidden(message);
    }

    return scope.requesterInstitutionId;
}

export function requireDepartmentId(
    scope: RequesterAcademicScope,
    message = 'Forbidden: No department assigned to this account',
) {
    if (!scope.requesterDepartmentId) {
        forbidden(message);
    }

    return scope.requesterDepartmentId;
}

export function requireCourseId(
    scope: RequesterAcademicScope,
    message = 'Forbidden: No course assigned to this admin account',
) {
    if (!scope.requesterCourseId) {
        forbidden(message);
    }

    return scope.requesterCourseId;
}

export function ensureInstitutionScope(
    institutionId: string | null | undefined,
    scope: RequesterAcademicScope,
    label: string,
) {
    if (scope.requesterInstitutionId && institutionId !== scope.requesterInstitutionId) {
        forbidden(`Forbidden: Cannot manage ${label} outside your institution`);
    }
}

export function uniqueStrings(values?: Array<string | null | undefined>) {
    return Array.from(new Set((values ?? []).filter((value): value is string => Boolean(value))));
}

export function uniqueNumbers(values?: Array<number | null | undefined>) {
    return Array.from(new Set((values ?? []).filter((value): value is number => typeof value === 'number')));
}
