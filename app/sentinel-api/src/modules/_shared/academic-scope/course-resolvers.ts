import { type DbClient } from '@sentinel/db';
import { assertDepartmentRecordInScope } from './record-assertions';
import { requireDepartmentId } from './helpers';
import type { RequesterAcademicScope } from './types';

export async function resolveCourseDepartmentForMutation(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    departmentId?: string | null,
) {
    const targetDepartmentId = departmentId ?? scope.requesterDepartmentId ?? null;

    if (!targetDepartmentId) {
        requireDepartmentId(scope);
    }

    const resolvedDepartmentId = targetDepartmentId ?? requireDepartmentId(scope);

    await assertDepartmentRecordInScope(dbClient, scope, resolvedDepartmentId);

    return resolvedDepartmentId;
}
