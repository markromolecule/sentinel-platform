import { getExamArchiveCutoff, normalizeExamStatus } from '@sentinel/shared';
import type { ExamAccessEligibility } from '../access.dto';

export type BasicEligibilityStudent = {
    student_id: string;
    institution_id: string | null;
} | undefined;

export type BasicEligibilityExam = {
    exam_id: string;
    subject_id: string | null;
    institution_id: string | null;
    status: string | null;
    published_at: Date | string | null;
    scheduled_date: Date | string | null;
    end_date_time: Date | string | null;
    duration_minutes: number;
    room_id: string | null;
    assigned_room_id: string | null;
    room_institution_id: string | null;
    class_group_id: string | null;
    section_id: string | null;
    assigned_section_ids: string[] | null;
    max_reconnect_attempts: number | null;
    lobby_admission_mode: string | null;
} | undefined;

export type ValidateBasicEligibilityArgs = {
    student: BasicEligibilityStudent;
    exam: BasicEligibilityExam;
    now: Date;
};

export type ValidateBasicEligibilityResult =
    | { isEligible: false; errorResponse: ExamAccessEligibility }
    | { isEligible: true; startsAt: Date; endsAt: Date };

/**
 * Validates the core basic constraints for exam access:
 * profile existence, institution membership, publication status, date configurations,
 * start/end times, and room assignment matches.
 */
export function validateBasicEligibility({
    student,
    exam,
    now,
}: ValidateBasicEligibilityArgs): ValidateBasicEligibilityResult {
    if (!student) {
        return {
            isEligible: false,
            errorResponse: {
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
            },
        };
    }

    if (!exam || !exam.subject_id) {
        return {
            isEligible: false,
            errorResponse: {
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
            errorResponse: {
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
                    startsAt: exam.scheduled_date instanceof Date ? exam.scheduled_date : (exam.scheduled_date ? new Date(exam.scheduled_date) : null),
                    endsAt: exam.end_date_time instanceof Date ? exam.end_date_time : (exam.end_date_time ? new Date(exam.end_date_time) : null),
                    reopenedUntil: null,
                },
            },
        };
    }

    const normalizedStatus = normalizeExamStatus(exam.status);
    if (!exam.published_at || ['draft', 'archived', 'completed'].includes(normalizedStatus)) {
        return {
            isEligible: false,
            errorResponse: {
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
                    startsAt: exam.scheduled_date instanceof Date ? exam.scheduled_date : (exam.scheduled_date ? new Date(exam.scheduled_date) : null),
                    endsAt: exam.end_date_time instanceof Date ? exam.end_date_time : (exam.end_date_time ? new Date(exam.end_date_time) : null),
                    reopenedUntil: null,
                },
            },
        };
    }

    if (!exam.scheduled_date) {
        return {
            isEligible: false,
            errorResponse: {
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
                    endsAt: exam.end_date_time instanceof Date ? exam.end_date_time : (exam.end_date_time ? new Date(exam.end_date_time) : null),
                    reopenedUntil: null,
                },
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
            errorResponse: {
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
                    startsAt: exam.scheduled_date instanceof Date ? exam.scheduled_date : (exam.scheduled_date ? new Date(exam.scheduled_date) : null),
                    endsAt: exam.end_date_time instanceof Date ? exam.end_date_time : (exam.end_date_time ? new Date(exam.end_date_time) : null),
                    reopenedUntil: null,
                },
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
            errorResponse: {
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
            errorResponse: {
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
            },
        };
    }

    return {
        isEligible: true,
        startsAt,
        endsAt,
    };
}
