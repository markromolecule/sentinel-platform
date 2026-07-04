import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
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

    const subjectLabel =
        subjectOffering.subject_code && subjectOffering.subject_title
            ? `${subjectOffering.subject_code} - ${subjectOffering.subject_title}`
            : subjectOffering.subject_title || subjectOffering.subject_code || 'Subject';

    const classGroups = await ensureClassGroupsForResolvedSections({
        dbClient,
        subjectOffering,
        resolvedSectionIds,
    });
    const classGroupIds: string[] = [];
    const createdRequestIds: string[] = [];

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
                const createdRequest = await dbClient
                    .insertInto('enrollment_requests')
                    .values({
                        class_group_id: classGroup.class_group_id,
                        user_id: userId,
                        status: 'PENDING',
                    })
                    .returning('request_id')
                    .executeTakeFirstOrThrow();
                createdRequestIds.push(createdRequest.request_id);
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
        createdRequestIds,
        institutionId: subjectOffering.institution_id,
        subjectOfferingId: subjectOffering.subject_offering_id,
        subjectLabel,
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

export const assignOfferedSubjectData = async ({
    dbClient,
    instructorId,
    subjectOfferingId,
    approvedBy,
}: {
    dbClient: DbClient;
    instructorId: string;
    subjectOfferingId: string;
    approvedBy: string;
}) => {
    // 1. Fetch the subject offering
    const subjectOffering = await dbClient
        .selectFrom('subject_offerings as so')
        .innerJoin('subjects as sub', 'sub.subject_id', 'so.subject_id')
        .select([
            'so.subject_offering_id',
            'so.subject_id',
            'so.term_id',
            'so.institution_id',
            'so.status',
            'sub.subject_code',
            'sub.subject_title',
        ])
        .where('so.subject_offering_id', '=', subjectOfferingId)
        .executeTakeFirst();

    if (!subjectOffering) {
        throw new HTTPException(404, { message: 'Offered subject not found' });
    }

    if (subjectOffering.status === 'CLOSED' || subjectOffering.status === 'ARCHIVED') {
        throw new HTTPException(400, {
            message: 'This offered subject is no longer open for assignment',
        });
    }

    // 2. Fetch sections associated with the subjectOfferingId
    const allowedSections = await dbClient
        .selectFrom('subject_offering_sections')
        .select('section_id')
        .where('subject_offering_id', '=', subjectOfferingId)
        .execute();

    const sectionIds = allowedSections.map((s) => s.section_id);

    if (sectionIds.length === 0) {
        throw new HTTPException(400, {
            message: 'No sections are configured for this offered subject',
        });
    }

    // 3. Ensure class groups exist for the sections
    const classGroups = await ensureClassGroupsForResolvedSections({
        dbClient,
        subjectOffering: subjectOffering as any,
        resolvedSectionIds: sectionIds,
    });

    // Find instructor role
    const instructorRole = await dbClient
        .selectFrom('roles')
        .select('role_id')
        .where('role_name', '=', 'instructor')
        .executeTakeFirst();

    if (!instructorRole) {
        throw new Error('Instructor role not defined in the database.');
    }

    const assignedClassGroupIds: string[] = [];
    const enrollmentRequestIds: string[] = [];
    const classRoleIds: string[] = [];

    for (const classGroup of classGroups) {
        assignedClassGroupIds.push(classGroup.class_group_id);

        // 4. Insert or update enrollment_requests record
        const existingRequest = await dbClient
            .selectFrom('enrollment_requests')
            .select(['request_id', 'status'])
            .where('class_group_id', '=', classGroup.class_group_id)
            .where('user_id', '=', instructorId)
            .executeTakeFirst();

        let requestId: string;

        if (existingRequest) {
            requestId = existingRequest.request_id;
            if (existingRequest.status !== 'APPROVED') {
                await dbClient
                    .updateTable('enrollment_requests')
                    .set({
                        status: 'APPROVED',
                        approved_by: approvedBy,
                        updated_at: new Date(),
                    })
                    .where('request_id', '=', requestId)
                    .execute();
            }
        } else {
            const inserted = await dbClient
                .insertInto('enrollment_requests')
                .values({
                    class_group_id: classGroup.class_group_id,
                    user_id: instructorId,
                    status: 'APPROVED',
                    approved_by: approvedBy,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                .returning('request_id')
                .executeTakeFirstOrThrow();
            requestId = inserted.request_id;
        }
        enrollmentRequestIds.push(requestId);

        // 5. Insert class_roles mapping
        const existingRole = await dbClient
            .selectFrom('class_roles')
            .select('class_group_id')
            .where('class_group_id', '=', classGroup.class_group_id)
            .where('user_id', '=', instructorId)
            .where('role_id', '=', instructorRole.role_id)
            .executeTakeFirst();

        if (!existingRole) {
            await dbClient
                .insertInto('class_roles')
                .values({
                    class_group_id: classGroup.class_group_id,
                    user_id: instructorId,
                    role_id: instructorRole.role_id,
                    assigned_at: new Date(),
                })
                .execute();
        }
        classRoleIds.push(`${classGroup.class_group_id}:${instructorId}:${instructorRole.role_id}`);
    }

    return {
        assignedClassGroupIds,
        enrollmentRequestIds,
        classRoleIds,
    };
};
