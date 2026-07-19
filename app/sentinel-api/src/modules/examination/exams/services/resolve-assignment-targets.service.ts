import { type DbClient } from '@sentinel/db';
import type { UpdateExamBody } from '../exam.dto';
import type { RawExamRecord } from './map-exam-response.service';
import {
    resolveInstructorExamAssignmentTargets,
    type ResolvedExamAssignmentTargets,
} from './resolve-classroom-assignment.service';

interface ResolveAssignmentTargetsArgs {
    dbClient: DbClient;
    body: UpdateExamBody;
    current: RawExamRecord;
    userId: string;
    targetInstitutionId?: string;
    role?: string;
}

/**
 * Resolves assignment targets based on the request body and the current exam state.
 * Returns null if no assignment-relevant fields were provided.
 */
export async function resolveAssignmentTargets({
    dbClient,
    body,
    current,
    userId,
    targetInstitutionId,
    role,
}: ResolveAssignmentTargetsArgs): Promise<ResolvedExamAssignmentTargets | null> {
    const hasAssignmentRelevantChange =
        body.classroomId !== undefined ||
        body.classroomIds !== undefined ||
        body.sectionIds !== undefined ||
        body.roomId !== undefined ||
        body.instructorId !== undefined ||
        body.instructorIds !== undefined ||
        body.startDateTime !== undefined;

    if (!hasAssignmentRelevantChange) {
        return null;
    }

    const resolvedClassroomId =
        body.classroomId !== undefined
            ? body.classroomId
            : body.classroomIds !== undefined &&
                body.classroomIds !== null &&
                body.classroomIds.length > 0
              ? body.classroomIds[0]
              : (current.class_group_id ?? null);

    if (resolvedClassroomId === null) {
        return {
            classroomAssignment: {
                classGroupId: null,
                className: null,
                institutionId: targetInstitutionId ?? null,
                subjectId: current.subject_id ?? body.subjectId ?? null,
                subjectTitle: null,
                sectionId: null,
                sectionName: null,
            },
            assignedSectionIds: [],
            resolvedClassrooms: [],
        };
    }

    const resolvedSectionIds =
        body.sectionIds !== undefined
            ? (body.sectionIds ?? [])
            : current.section_id
              ? [current.section_id]
              : [];

    return await resolveInstructorExamAssignmentTargets({
        dbClient,
        classroomId: resolvedClassroomId,
        userId,
        institutionId: targetInstitutionId,
        sectionIds: resolvedSectionIds,
        role,
    });
}
