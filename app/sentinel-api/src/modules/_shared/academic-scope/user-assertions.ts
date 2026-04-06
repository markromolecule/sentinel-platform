import { type DbClient } from '@sentinel/db';
import { forbidden } from './errors';
import { isSuperadminScope } from './helpers';
import { assertCourseRecordInScope } from './record-assertions';
import type { RequesterAcademicScope } from './types';

export async function assertUserCourseAssignmentInScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    courseId?: string | null,
) {
    if (!courseId) {
        return null;
    }

    const courseRecord = await assertCourseRecordInScope(dbClient, scope, courseId);

    if (
        isSuperadminScope(scope) &&
        scope.requesterDepartmentId &&
        courseRecord.department_id !== scope.requesterDepartmentId
    ) {
        forbidden('Forbidden: Cannot assign administrators outside your department');
    }

    return courseRecord;
}
