import { type DbClient } from '@sentinel/db';
import { EnrollInstructorSubjectBody } from '../enrollments.dto';
import {
    ensureClassGroupsForResolvedSections,
    resolveEnrollmentRequestTargets,
} from './enrollment-request-targets';

export const enrollInstructorData = async ({
    dbClient,
    userId,
    payload,
    instructorDepartmentId,
}: {
    dbClient: DbClient;
    userId: string;
    payload: EnrollInstructorSubjectBody;
    instructorDepartmentId?: string | null;
}) => {
    const { subjectOffering, normalizedScope, resolvedSectionIds } =
        await resolveEnrollmentRequestTargets({
            dbClient,
            payload,
            instructorDepartmentId,
        });

    const classGroups = await ensureClassGroupsForResolvedSections({
        dbClient,
        subjectOffering,
        resolvedSectionIds,
    });
    const classGroupIds: string[] = [];

    let newRequestsCount = 0;
    let existingRequestsCount = 0;
    let existingRolesCount = 0;

    for (const classGroup of classGroups) {
        classGroupIds.push(classGroup.class_group_id);

        const existingRole = await dbClient
            .selectFrom('class_roles')
            .select(['class_group_id'])
            .where('class_group_id', '=', classGroup.class_group_id)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!existingRole) {
            // Check if there is already a pending request
            const existingRequest = await dbClient
                .selectFrom('enrollment_requests')
                .select(['request_id'])
                .where('class_group_id', '=', classGroup.class_group_id)
                .where('user_id', '=', userId)
                .where('status', '=', 'PENDING')
                .executeTakeFirst();

            if (!existingRequest) {
                await dbClient
                    .insertInto('enrollment_requests')
                    .values({
                        class_group_id: classGroup.class_group_id,
                        user_id: userId,
                        status: 'PENDING',
                    })
                    .execute();
                newRequestsCount++;
            } else {
                existingRequestsCount++;
            }
        } else {
            existingRolesCount++;
        }
    }

    const skippedCount = existingRequestsCount + existingRolesCount;

    return {
        classGroupIds,
        requestedDepartmentIds: normalizedScope.departmentIds,
        requestedCourseIds: normalizedScope.courseIds,
        requestedYearLevels: normalizedScope.yearLevels,
        resolvedSectionIds,
        resolvedSectionCount: resolvedSectionIds.length,
        newRequestsCount,
        existingRequestsCount,
        existingRolesCount,
        skippedCount,
        total: resolvedSectionIds.length,
    };
};
