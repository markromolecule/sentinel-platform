import { type DbClient } from '@sentinel/db';
import { forbidden, notFound } from './errors';
import { isAdminScope, isSuperadminScope } from './helpers';
import { getCourseScopeRecord, getDepartmentScopeRecord, getSectionScopeRecord } from './records';
import { resolveParentScope } from '../../core/inheritance/inheritance-resolver.helper';
import type {
    CourseScopeRecord,
    DepartmentScopeRecord,
    RequesterAcademicScope,
    SectionScopeRecord,
} from './types';

async function ensureEffectiveInstitutionScope(
    dbClient: DbClient,
    institutionId: string | null | undefined,
    scope: RequesterAcademicScope,
    label: string,
) {
    if (!scope.requesterInstitutionId || institutionId === scope.requesterInstitutionId) {
        return;
    }

    const requesterInstitution = await resolveParentScope(dbClient, scope.requesterInstitutionId);

    if (requesterInstitution.parentInstitutionId === institutionId) {
        return;
    }

    forbidden(`Forbidden: Cannot manage ${label} outside your institution`);
}

export async function assertDepartmentRecordInScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    departmentId: string,
): Promise<DepartmentScopeRecord> {
    const record = await getDepartmentScopeRecord(dbClient, departmentId);

    if (!record) {
        notFound('Department not found');
    }

    await ensureEffectiveInstitutionScope(dbClient, record.institution_id, scope, 'departments');

    if (
        !isSuperadminScope(scope) &&
        scope.requesterDepartmentId &&
        record.department_id !== scope.requesterDepartmentId
    ) {
        forbidden('Forbidden: Cannot manage data outside your department');
    }

    return record;
}

export async function assertCourseRecordInScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    courseId: string,
): Promise<CourseScopeRecord> {
    const record = await getCourseScopeRecord(dbClient, courseId);

    if (!record) {
        notFound('Course not found');
    }

    await ensureEffectiveInstitutionScope(dbClient, record.institution_id, scope, 'courses');

    if (
        !isSuperadminScope(scope) &&
        scope.requesterDepartmentId &&
        record.department_id !== scope.requesterDepartmentId
    ) {
        forbidden('Forbidden: Cannot manage data outside your department');
    }

    if (
        isAdminScope(scope) &&
        scope.requesterCourseId &&
        record.course_id !== scope.requesterCourseId
    ) {
        forbidden('Forbidden: Cannot manage data outside your assigned course');
    }

    return record;
}

export async function assertSectionRecordInScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    sectionId: string,
): Promise<SectionScopeRecord> {
    const record = await getSectionScopeRecord(dbClient, sectionId);

    if (!record) {
        notFound('Section not found');
    }

    await ensureEffectiveInstitutionScope(dbClient, record.institution_id, scope, 'sections');

    if (
        !isSuperadminScope(scope) &&
        scope.requesterDepartmentId &&
        record.department_id !== scope.requesterDepartmentId
    ) {
        forbidden('Forbidden: Cannot manage data outside your department');
    }

    if (
        isAdminScope(scope) &&
        scope.requesterCourseId &&
        record.course_id !== scope.requesterCourseId
    ) {
        forbidden('Forbidden: Cannot manage data outside your assigned course');
    }

    return record;
}
