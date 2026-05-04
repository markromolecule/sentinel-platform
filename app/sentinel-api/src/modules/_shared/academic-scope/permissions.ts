import { forbidden } from './errors';
import { isAdminScope, isSuperadminScope, isSupportScope, requireInstitutionId } from './helpers';
import type { RequesterAcademicScope, SubjectOfferingScopeRecord } from './types';

export function assertSubjectCatalogWriteAccess(scope: RequesterAcademicScope) {
    if (!isSuperadminScope(scope) && !isSupportScope(scope)) {
        forbidden('Forbidden: Only superadmin or support can manage the shared subject catalog');
    }

    requireInstitutionId(scope);
}

export function assertCourseMutationAccess(scope: RequesterAcademicScope) {
    if (!isSuperadminScope(scope) && !isSupportScope(scope)) {
        forbidden('Forbidden: Only superadmin or support can manage courses');
    }
}

export function assertSectionMutationAccess(scope: RequesterAcademicScope) {
    if (!isAdminScope(scope) && !isSuperadminScope(scope) && !isSupportScope(scope)) {
        forbidden('Forbidden: Insufficient permissions to manage sections');
    }
}

export function assertSubjectOfferingMutationAccess(scope: RequesterAcademicScope) {
    if (!isAdminScope(scope) && !isSuperadminScope(scope) && !isSupportScope(scope)) {
        forbidden('Forbidden: Insufficient permissions to manage subject offerings');
    }
}

export function assertSubjectOfferingRecordInScope(
    scope: RequesterAcademicScope,
    offering: SubjectOfferingScopeRecord,
) {
    if (
        isAdminScope(scope) &&
        scope.requesterCourseId &&
        !offering.courseIds?.includes(scope.requesterCourseId)
    ) {
        forbidden('Forbidden: Cannot manage subject offerings outside your assigned course');
    }
}
