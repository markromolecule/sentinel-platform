import { type DbClient } from '@sentinel/db';
import { getExamArchiveCutoff, normalizeExamStatus } from '@sentinel/shared';
import type { ExamAccessEligibility } from '../access.dto';
import { EntitlementsRepository } from '../data/entitlements.repository';
import { RuntimeAccessService } from '../../runtime-access/runtime-access.service';
import {
    buildStudentOverrideRuntimeAccess,
    StudentOverridesService,
} from '../../student-overrides/student-overrides.service';
import type { LobbyAdmissionStatus } from '../../lobby/lobby.dto';

function buildLobbyRuntimeAccess(args: {
    scheduledRuntimeAccess: Awaited<
        ReturnType<typeof RuntimeAccessService.resolveExamRuntimeAccess>
    >;
    admissionStatus: LobbyAdmissionStatus | null;
}) {
    const { scheduledRuntimeAccess, admissionStatus } = args;

    if (admissionStatus === 'APPROVED') {
        return {
            ...scheduledRuntimeAccess,
            state: 'lobby_approved' as const,
            reasonCode: 'LOBBY_APPROVED' as const,
            message: 'Instructor approval received. You may now continue to the exam attempt.',
            canStart: true,
            canResume: false,
        };
    }

    if (admissionStatus === 'REJECTED') {
        return {
            ...scheduledRuntimeAccess,
            state: 'lobby_waiting' as const,
            reasonCode: 'LOBBY_REJECTED' as const,
            message:
                'Your lobby request is not approved yet. Stay in the lobby and wait for the instructor to admit you.',
            canStart: false,
            canResume: false,
        };
    }

    return {
        ...scheduledRuntimeAccess,
        state: 'lobby_waiting' as const,
        reasonCode: 'LOBBY_WAITING' as const,
        message:
            'This exam requires instructor approval before you can enter the attempt. Stay in the lobby while waiting.',
        canStart: false,
        canResume: false,
    };
}

export class AccessGatekeeperService {
    /**
     * Verifies if a student is completely eligible to enter the exam flow right now.
     * Evaluates enrollment, active status, time-window logic, and basic room assignments.
     */
    static async verifyStudentExamEligibility(
        db: DbClient,
        userId: string,
        examId: string,
        now = new Date(),
    ): Promise<ExamAccessEligibility> {
        const [student, exam] = await Promise.all([
            EntitlementsRepository.getStudentProfileByUserId(db, userId),
            EntitlementsRepository.getExamAccessPolicy(db, examId),
        ]);

        if (!student) {
            return {
                isEligible: false,
                reason: 'Student profile not found for the authenticated account.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Student profile not found for the authenticated account.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
            };
        }

        if (!exam || !exam.subject_id) {
            return {
                isEligible: false,
                reason: 'Exam not found or missing subject assignment.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam not found or missing subject assignment.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: null,
                    reopenedUntil: null,
                },
            };
        }

        if (
            student.institution_id &&
            exam.institution_id &&
            student.institution_id !== exam.institution_id
        ) {
            return {
                isEligible: false,
                reason: 'Student and exam belong to different institutions.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Student and exam belong to different institutions.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: exam.scheduled_date,
                    endsAt: exam.end_date_time,
                    reopenedUntil: null,
                },
            };
        }

        const normalizedStatus = normalizeExamStatus(exam.status);
        if (!exam.published_at || ['draft', 'archived', 'completed'].includes(normalizedStatus)) {
            return {
                isEligible: false,
                reason: 'Exam is not available for student access.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam is not available for student access.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: exam.scheduled_date,
                    endsAt: exam.end_date_time,
                    reopenedUntil: null,
                },
            };
        }

        if (!exam.scheduled_date) {
            return {
                isEligible: false,
                reason: 'Exam start time is not configured.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam start time is not configured.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: null,
                    endsAt: exam.end_date_time,
                    reopenedUntil: null,
                },
            };
        }

        const startsAt =
            exam.scheduled_date instanceof Date
                ? exam.scheduled_date
                : new Date(exam.scheduled_date);
        if (Number.isNaN(startsAt.getTime())) {
            return {
                isEligible: false,
                reason: 'Exam start time is invalid.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam start time is invalid.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt: exam.scheduled_date,
                    endsAt: exam.end_date_time,
                    reopenedUntil: null,
                },
            };
        }

        const endsAt = getExamArchiveCutoff({
            scheduledDate: exam.scheduled_date,
            endDateTime: exam.end_date_time,
            durationMinutes: exam.duration_minutes,
            now,
        });

        if (!endsAt) {
            return {
                isEligible: false,
                reason: 'Exam end time is not configured.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam end time is not configured.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt,
                    endsAt: null,
                    reopenedUntil: null,
                },
            };
        }

        if (
            exam.room_id &&
            (!exam.assigned_room_id ||
                (exam.room_institution_id &&
                    exam.institution_id &&
                    exam.room_institution_id !== exam.institution_id))
        ) {
            return {
                isEligible: false,
                reason: 'Exam room assignment is invalid.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'Exam room assignment is invalid.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt,
                    endsAt,
                    reopenedUntil: null,
                },
            };
        }

        const isEnrolled = await EntitlementsRepository.hasStudentExamEnrollment(db, {
            studentId: student.student_id,
            classGroupId: exam.class_group_id,
            subjectId: exam.subject_id,
            sectionId: exam.section_id,
            sectionIds: exam.assigned_section_ids,
        });

        if (!isEnrolled) {
            return {
                isEligible: false,
                reason: 'Student is not actively enrolled in the exam subject or assigned section.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message:
                        'Student is not actively enrolled in the exam subject or assigned section.',
                    canStart: false,
                    canResume: false,
                    hasActiveAttempt: false,
                    startsAt,
                    endsAt,
                    reopenedUntil: null,
                },
            };
        }

        const latestAttempt = await EntitlementsRepository.getStudentLatestExamAttempt(db, {
            studentId: student.student_id,
            examId: exam.exam_id,
        });
        const latestLobbyAdmission = await EntitlementsRepository.getStudentLatestLobbyAdmission(
            db,
            {
                studentId: student.student_id,
                examId: exam.exam_id,
            },
        );
        const persistedRuntimeAccess = await RuntimeAccessService.getPersistedExamRuntimeAccess(
            db,
            exam.exam_id,
        );
        const scheduledRuntimeAccess = await RuntimeAccessService.resolveExamRuntimeAccess({
            dbClient: db,
            examId: exam.exam_id,
            scheduledDate: exam.scheduled_date,
            endDateTime: exam.end_date_time,
            durationMinutes: exam.duration_minutes,
            now,
            hasActiveAttempt: latestAttempt?.status === 'IN_PROGRESS',
        });
        const accessOverride = await StudentOverridesService.getActiveStudentExamOverride({
            dbClient: db,
            examId: exam.exam_id,
            studentId: student.student_id,
            now,
        });
        const runtimeAccess =
            exam.lobby_admission_mode === 'INSTRUCTOR_GATED' &&
            !latestAttempt?.completed_at &&
            latestAttempt?.status !== 'IN_PROGRESS' &&
            (scheduledRuntimeAccess.canStart || accessOverride)
                ? buildLobbyRuntimeAccess({
                      scheduledRuntimeAccess,
                      admissionStatus: latestLobbyAdmission?.status ?? null,
                  })
                : scheduledRuntimeAccess;

        if (
            accessOverride &&
            persistedRuntimeAccess?.state !== 'closed' &&
            !scheduledRuntimeAccess.canStart &&
            !scheduledRuntimeAccess.canResume
        ) {
            return {
                isEligible: true,
                context: {
                    examId: exam.exam_id,
                    studentId: student.student_id,
                    classroomId: exam.class_group_id,
                    subjectId: exam.subject_id,
                    sectionId: exam.section_id,
                    sectionIds: exam.assigned_section_ids,
                    roomId: exam.room_id,
                    durationMinutes: exam.duration_minutes,
                    scheduledDate: exam.scheduled_date,
                    endDateTime: exam.end_date_time,
                    status: exam.status,
                    publishedAt: exam.published_at,
                    institutionId: exam.institution_id,
                },
                runtimeAccess: buildStudentOverrideRuntimeAccess({
                    accessOverride,
                    runtimeAccess: scheduledRuntimeAccess,
                    hasActiveAttempt: latestAttempt?.status === 'IN_PROGRESS',
                }),
                accessOverride,
            };
        }

        if (!runtimeAccess.canStart && !runtimeAccess.canResume) {
            return {
                isEligible: false,
                reason: runtimeAccess.message,
                reasonCode: runtimeAccess.reasonCode,
                runtimeAccess,
                accessOverride: accessOverride ?? null,
            };
        }

        return {
            isEligible: true,
            context: {
                examId: exam.exam_id,
                studentId: student.student_id,
                classroomId: exam.class_group_id,
                subjectId: exam.subject_id,
                sectionId: exam.section_id,
                sectionIds: exam.assigned_section_ids,
                roomId: exam.room_id,
                durationMinutes: exam.duration_minutes,
                scheduledDate: exam.scheduled_date,
                endDateTime: exam.end_date_time,
                status: exam.status,
                publishedAt: exam.published_at,
                institutionId: exam.institution_id,
            },
            runtimeAccess,
            accessOverride: accessOverride ?? null,
        };
    }
}
