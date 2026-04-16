import { type DbClient } from '@sentinel/db';
import { assertCourseRecordInScope, assertDepartmentRecordInScope } from './record-assertions';
import { badRequest } from './errors';
import { isAdminScope, requireCourseId } from './helpers';
import type { RequesterAcademicScope, SectionScopePayloadArgs } from './types';

export async function resolveSectionPayloadForScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    args: SectionScopePayloadArgs,
) {
    const targetCourseId = isAdminScope(scope)
        ? (scope.requesterCourseId ?? args.courseId ?? null)
        : (args.courseId ?? null);

    if (!targetCourseId) {
        if (isAdminScope(scope)) {
            requireCourseId(scope);
        }

        const targetDepartmentId = args.departmentId ?? scope.requesterDepartmentId ?? null;

        if (targetDepartmentId) {
            await assertDepartmentRecordInScope(dbClient, scope, targetDepartmentId);
        }

        return {
            departmentId: targetDepartmentId,
            courseId: null,
        };
    }

    const courseRecord = await assertCourseRecordInScope(dbClient, scope, targetCourseId);

    if (
        args.departmentId &&
        courseRecord.department_id &&
        args.departmentId !== courseRecord.department_id
    ) {
        badRequest('Course does not belong to the selected department');
    }

    return {
        departmentId: courseRecord.department_id ?? args.departmentId ?? null,
        courseId: courseRecord.course_id,
    };
}
