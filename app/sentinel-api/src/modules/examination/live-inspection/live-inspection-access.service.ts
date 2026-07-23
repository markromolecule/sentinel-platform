import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { hasActivePermission } from '../../../lib/permissions';
import { SessionRepository } from '../flow/data/session.repository';
import { getExamConfigurationState } from '../configuration/configuration.service';

const LIVE_VIDEO_PERMISSION = 'examinations:monitor_live_video';
const DENIED_MESSAGE = 'Live inspection is not available for this attempt.';
const STAFF_ROLES = new Set(['superadmin', 'admin', 'instructor']);

type ActivePermissionInput = Set<string> | string[] | undefined;

export type LiveInspectionViewerAccessArgs = {
    dbClient: DbClient;
    attemptId: string;
    viewerUserId: string;
    role: string;
    activeInstitutionId: string;
    activePermissionKeys?: ActivePermissionInput;
};

export type LiveInspectionStudentAccessArgs = {
    dbClient: DbClient;
    sessionId: string;
    studentUserId: string;
};

type ViewerAccessRecord = {
    attemptId: string;
    examId: string;
    institutionId: string | null;
    createdBy: string | null;
    isAcceptedProctor: boolean;
    isSectionInstructor: boolean;
    isClassroomInstructor: boolean;
};

/**
 * Enforces live-video staff access beyond general exam visibility.
 */
export async function assertLiveInspectionViewerAccess(args: LiveInspectionViewerAccessArgs) {
    const normalizedRole = args.role.trim().toLowerCase();

    if (
        !STAFF_ROLES.has(normalizedRole) ||
        !hasActivePermission(args.activePermissionKeys ?? [], LIVE_VIDEO_PERMISSION)
    ) {
        throwForbidden();
    }

    const record = await getViewerAccessRecord(args);

    if (!record || record.institutionId !== args.activeInstitutionId) {
        throwNotFound();
    }

    if (normalizedRole === 'instructor' && !isInstructorRelated(args.viewerUserId, record)) {
        throwNotFound();
    }

    return record;
}

/**
 * Enforces student ownership and attempt readiness before browser wake-up.
 */
export async function assertLiveInspectionStudentAccess(args: LiveInspectionStudentAccessArgs) {
    const attempt = await SessionRepository.getOwnedSessionAttempt(args.dbClient, {
        sessionId: args.sessionId,
        studentUserId: args.studentUserId,
    });

    if (!attempt?.exam_id) {
        throwNotFound();
    }

    const configState = await getExamConfigurationState(args.dbClient, attempt.exam_id);

    if (
        configState.configuration.cameraRequired !== true ||
        attempt.completed_at ||
        attempt.status === 'COMPLETED' ||
        ['LOCKED', 'CLOSED', 'SUPERSEDED'].includes(String(attempt.lifecycle_state ?? ''))
    ) {
        throwForbidden();
    }

    return attempt;
}

async function getViewerAccessRecord(args: LiveInspectionViewerAccessArgs) {
    return (await args.dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select((eb) => [
            'ea.attempt_id as attemptId',
            'e.exam_id as examId',
            'e.institution_id as institutionId',
            'e.created_by as createdBy',
            eb
                .exists(
                    eb
                        .selectFrom('proctor_assignments as pa')
                        .select('pa.assignment_id')
                        .whereRef('pa.exam_id', '=', 'e.exam_id')
                        .where('pa.instructor_id', '=', args.viewerUserId)
                        .where('pa.status', '=', 'ACCEPTED'),
                )
                .as('isAcceptedProctor'),
            eb
                .exists(
                    eb
                        .selectFrom('exam_section_assignments as esa')
                        .select('esa.id')
                        .whereRef('esa.exam_id', '=', 'e.exam_id')
                        .where('esa.instructor_id', '=', args.viewerUserId),
                )
                .as('isSectionInstructor'),
            eb
                .exists(
                    eb
                        .selectFrom('classroom_instructor_assignments as cia')
                        .innerJoin('exams as ce', 'ce.class_group_id', 'cia.class_group_id')
                        .select('cia.assignment_id')
                        .whereRef('ce.exam_id', '=', 'e.exam_id')
                        .where('cia.instructor_user_id', '=', args.viewerUserId),
                )
                .as('isClassroomInstructor'),
        ])
        .where('ea.attempt_id', '=', args.attemptId)
        .executeTakeFirst()) as ViewerAccessRecord | undefined;
}

function isInstructorRelated(viewerUserId: string, record: ViewerAccessRecord) {
    return (
        record.createdBy === viewerUserId ||
        record.isAcceptedProctor ||
        record.isSectionInstructor ||
        record.isClassroomInstructor
    );
}

function throwForbidden(): never {
    throw new HTTPException(403, { message: DENIED_MESSAGE });
}

function throwNotFound(): never {
    throw new HTTPException(404, { message: DENIED_MESSAGE });
}
