import { type DbClient } from '@sentinel/db';
import { forbidden, notFound } from './errors';
import { ensureInstitutionScope, isAdminScope } from './helpers';
import {
    getCourseScopeRecord,
    getDepartmentScopeRecord,
    getSectionScopeRecord,
} from './records';
import type {
    CourseScopeRecord,
    DepartmentScopeRecord,
    RequesterAcademicScope,
    SectionScopeRecord,
} from './types';

export async function assertDepartmentRecordInScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    departmentId: string,
): Promise<DepartmentScopeRecord> {
    const record = await getDepartmentScopeRecord(dbClient, departmentId);

    if (!record) {
        notFound('Department not found');
    }

    ensureInstitutionScope(record.institution_id, scope, 'departments');

    if (scope.requesterDepartmentId && record.department_id !== scope.requesterDepartmentId) {
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

    ensureInstitutionScope(record.institution_id, scope, 'courses');

    if (scope.requesterDepartmentId && record.department_id !== scope.requesterDepartmentId) {
        forbidden('Forbidden: Cannot manage data outside your department');
    }

    if (isAdminScope(scope) && scope.requesterCourseId && record.course_id !== scope.requesterCourseId) {
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

    ensureInstitutionScope(record.institution_id, scope, 'sections');

    if (scope.requesterDepartmentId && record.department_id !== scope.requesterDepartmentId) {
        forbidden('Forbidden: Cannot manage data outside your department');
    }

    if (isAdminScope(scope) && scope.requesterCourseId && record.course_id !== scope.requesterCourseId) {
        forbidden('Forbidden: Cannot manage data outside your assigned course');
    }

    return record;
}
