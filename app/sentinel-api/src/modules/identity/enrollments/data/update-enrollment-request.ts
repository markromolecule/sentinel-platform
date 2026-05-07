import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    assertSectionRecordInScope,
    buildRequesterAcademicScope,
    resolveSubjectOfferingAssignmentsForScope,
} from '../../../_shared/academic-scope';
import type { EnrollInstructorSubjectBody, UpdateEnrollmentRequestBody } from '../enrollments.dto';
import {
    ensureClassGroupsForResolvedSections,
    resolveEnrollmentRequestTargets,
} from './enrollment-request-targets';

function toUniqueIds(values: string[]) {
    return Array.from(new Set(values));
}

function toEnrollmentPayload(payload: UpdateEnrollmentRequestBody): EnrollInstructorSubjectBody {
    return {
        subject_offering_id: payload.subject_offering_id,
        department_id: payload.department_id,
        course_id: payload.course_id,
        year_level: payload.year_level,
        department_ids: payload.department_ids,
        course_ids: payload.course_ids,
        year_levels: payload.year_levels,
        section_ids: payload.section_ids,
    };
}

export const updateEnrollmentRequestData = async ({
    dbClient,
    payload,
    requesterRole,
    requesterUserId,
    requesterInstitutionId,
    requesterDepartmentId,
    requesterCourseId,
}: {
    dbClient: DbClient;
    payload: UpdateEnrollmentRequestBody;
    requesterRole?: string;
    requesterUserId: string;
    requesterInstitutionId?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
}) => {
    const requestIds = toUniqueIds(payload.request_ids);

    const existingRequests = await dbClient
        .selectFrom('enrollment_requests as er')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'er.class_group_id')
        .select([
            'er.request_id',
            'er.class_group_id',
            'er.user_id',
            'er.status',
            'cg.section_id',
            'cg.institution_id',
        ])
        .where('er.request_id', 'in', requestIds)
        .execute();

    if (existingRequests.length !== requestIds.length) {
        const foundRequestIds = new Set(existingRequests.map((request) => request.request_id));
        const missingRequestId = requestIds.find((requestId) => !foundRequestIds.has(requestId));
        throw new HTTPException(404, {
            message: `Enrollment request ${missingRequestId} not found`,
        });
    }

    const targetUserIds = toUniqueIds(existingRequests.map((request) => request.user_id));

    if (targetUserIds.length !== 1) {
        throw new HTTPException(400, {
            message: 'Enrollment request updates must target a single instructor request set',
        });
    }

    const targetUserId = targetUserIds[0];

    if (requesterRole === 'instructor') {
        if (targetUserId !== requesterUserId) {
            throw new HTTPException(403, {
                message: 'Forbidden. Instructors can only update their own enrollment requests.',
            });
        }
    } else if (requesterRole !== 'admin' && requesterRole !== 'superadmin') {
        throw new HTTPException(403, {
            message:
                'Forbidden. Only admins, superadmins, or the requesting instructor can update enrollment requests.',
        });
    }

    const scope = buildRequesterAcademicScope({
        requesterRole,
        requesterInstitutionId,
        requesterDepartmentId,
        requesterCourseId,
    });

    if (requesterRole !== 'instructor') {
        for (const request of existingRequests) {
            if (request.section_id) {
                await assertSectionRecordInScope(dbClient, scope, request.section_id);
                continue;
            }

            if (
                requesterInstitutionId &&
                request.institution_id &&
                request.institution_id !== requesterInstitutionId
            ) {
                throw new HTTPException(403, {
                    message:
                        'Forbidden. Cannot update enrollment requests outside your institution.',
                });
            }
        }
    }

    const scopedAssignments =
        requesterRole === 'instructor'
            ? null
            : await resolveSubjectOfferingAssignmentsForScope(dbClient, scope, {
                  departmentIds: payload.department_ids,
                  courseIds: payload.course_ids,
                  sectionIds: payload.section_ids,
                  yearLevels: payload.year_levels,
              });

    const normalizedPayload = toEnrollmentPayload({
        ...payload,
        department_ids: scopedAssignments?.departmentIds ?? payload.department_ids,
        course_ids: scopedAssignments?.courseIds ?? payload.course_ids,
        year_levels: scopedAssignments?.yearLevels ?? payload.year_levels,
        section_ids: scopedAssignments?.sectionIds ?? payload.section_ids,
    });

    const { subjectOffering, resolvedSectionIds } = await resolveEnrollmentRequestTargets({
        dbClient,
        payload: normalizedPayload,
        instructorDepartmentId:
            requesterRole === 'instructor' ? (requesterDepartmentId ?? null) : undefined,
    });

    const classGroups = await ensureClassGroupsForResolvedSections({
        dbClient,
        subjectOffering,
        resolvedSectionIds,
    });
    const nextClassGroupIds = classGroups.map((classGroup) => classGroup.class_group_id);
    const currentClassGroupIds = toUniqueIds(
        existingRequests.map((request) => request.class_group_id),
    );

    const conflictingRequest = await dbClient
        .selectFrom('enrollment_requests')
        .select(['request_id'])
        .where('user_id', '=', targetUserId)
        .where('class_group_id', 'in', nextClassGroupIds)
        .where('request_id', 'not in', requestIds)
        .executeTakeFirst();

    if (conflictingRequest) {
        throw new HTTPException(409, {
            message:
                'One or more selected sections already belong to another enrollment request for this instructor.',
        });
    }

    const conflictingRole = await dbClient
        .selectFrom('class_roles')
        .select(['class_group_id'])
        .where('user_id', '=', targetUserId)
        .where('class_group_id', 'in', nextClassGroupIds)
        .where('class_group_id', 'not in', currentClassGroupIds)
        .executeTakeFirst();

    if (conflictingRole) {
        throw new HTTPException(409, {
            message:
                'One or more selected sections are already assigned to this instructor and cannot be requested again.',
        });
    }

    const hadApprovedRequest = existingRequests.some((request) => request.status === 'APPROVED');

    if (hadApprovedRequest) {
        const instructorRole = await dbClient
            .selectFrom('roles')
            .select('role_id')
            .where('role_name', '=', 'instructor')
            .executeTakeFirst();

        if (!instructorRole) {
            throw new Error('Instructor role not defined in the database.');
        }

        await dbClient
            .deleteFrom('class_roles')
            .where('class_group_id', 'in', currentClassGroupIds)
            .where('user_id', '=', targetUserId)
            .where('role_id', '=', instructorRole.role_id)
            .execute();
    }

    await dbClient
        .deleteFrom('enrollment_requests')
        .where('request_id', 'in', requestIds)
        .execute();

    const insertedRequests = await dbClient
        .insertInto('enrollment_requests')
        .values(
            nextClassGroupIds.map((classGroupId) => ({
                class_group_id: classGroupId,
                user_id: targetUserId,
                status: 'PENDING' as const,
                approved_by: null,
                updated_at: new Date(),
            })),
        )
        .returning('request_id')
        .execute();

    const updatedRequestIds = insertedRequests.map((request) => request.request_id);

    return {
        request_ids: updatedRequestIds,
        class_group_ids: nextClassGroupIds,
        status: 'PENDING' as const,
        resolved_section_ids: resolvedSectionIds,
        resolved_section_count: resolvedSectionIds.length,
    };
};
