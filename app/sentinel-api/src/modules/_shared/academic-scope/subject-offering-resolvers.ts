import { type DbClient } from '@sentinel/db';
import {
    assertCourseRecordInScope,
    assertDepartmentRecordInScope,
    assertSectionRecordInScope,
} from './record-assertions';
import { forbidden } from './errors';
import {
    isAdminScope,
    isSuperadminScope,
    requireCourseId,
    uniqueNumbers,
    uniqueStrings,
} from './helpers';
import type {
    RequesterAcademicScope,
    SubjectOfferingScopeArgs,
} from './types';

export async function resolveSubjectOfferingAssignmentsForScope(
    dbClient: DbClient,
    scope: RequesterAcademicScope,
    args: SubjectOfferingScopeArgs,
) {
    const departmentIds = uniqueStrings(args.departmentIds);
    const sectionIds = uniqueStrings(args.sectionIds);
    const yearLevels = uniqueNumbers(args.yearLevels).sort((left, right) => left - right);

    if (isAdminScope(scope)) {
        const assignedCourseId = requireCourseId(scope);
        const courseRecord = await assertCourseRecordInScope(dbClient, scope, assignedCourseId);

        for (const sectionId of sectionIds) {
            const sectionRecord = await assertSectionRecordInScope(dbClient, scope, sectionId);

            if (sectionRecord.course_id !== courseRecord.course_id) {
                forbidden('Forbidden: Sections must belong to your assigned course');
            }
        }

        return {
            departmentIds: courseRecord.department_id ? [courseRecord.department_id] : departmentIds,
            courseIds: [courseRecord.course_id],
            sectionIds,
            yearLevels,
        };
    }

    const scopedDepartmentIds =
        scope.requesterDepartmentId && !isSuperadminScope(scope)
            ? [scope.requesterDepartmentId]
            : departmentIds;

    for (const departmentId of scopedDepartmentIds) {
        await assertDepartmentRecordInScope(dbClient, scope, departmentId);
    }

    const scopedCourseIds = uniqueStrings(args.courseIds);

    for (const courseId of scopedCourseIds) {
        const courseRecord = await assertCourseRecordInScope(dbClient, scope, courseId);

        if (
            scopedDepartmentIds.length > 0 &&
            courseRecord.department_id &&
            !scopedDepartmentIds.includes(courseRecord.department_id)
        ) {
            forbidden('Forbidden: Courses must belong to your assigned department');
        }
    }

    for (const sectionId of sectionIds) {
        const sectionRecord = await assertSectionRecordInScope(dbClient, scope, sectionId);

        if (
            scopedDepartmentIds.length > 0 &&
            sectionRecord.department_id &&
            !scopedDepartmentIds.includes(sectionRecord.department_id)
        ) {
            forbidden('Forbidden: Sections must belong to your assigned department');
        }
    }

    return {
        departmentIds: scopedDepartmentIds,
        courseIds: scopedCourseIds,
        sectionIds,
        yearLevels,
    };
}
