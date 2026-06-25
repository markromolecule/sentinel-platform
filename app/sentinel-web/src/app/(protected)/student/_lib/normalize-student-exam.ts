import { resolveStudentExamStatus } from '@sentinel/shared';
import type { ProctorExam } from '@sentinel/shared/types';

const STUDENT_EXAM_STATUSES = new Set([
    'archived',
    'in-progress',
    'past_due',
    'turned_in',
    'completed',
]);

/**
 * Returns whether a normalized student exam status should remain visible in
 * active student feeds such as classroom assessments and the available tab.
 */
export function isActiveStudentExamStatus(status: string) {
    return status === 'available' || status === 'upcoming' || status === 'in-progress';
}

/**
 * Normalizes student-facing exam statuses when upstream responses still carry
 * instructor/internal values such as "published".
 */
export function normalizeStudentExam(exam: ProctorExam): ProctorExam {
    if (exam.completedAt) {
        return {
            ...exam,
            status: 'turned_in',
        };
    }

    if (STUDENT_EXAM_STATUSES.has(exam.status)) {
        return {
            ...exam,
            status:
                exam.status === 'archived' || exam.status === 'past_due'
                    ? exam.status
                    : exam.status === 'completed'
                    ? 'turned_in'
                    : resolveStudentExamStatus({
                          status: exam.status,
                          scheduledDate: exam.scheduledDate,
                          endDateTime: exam.endDateTime,
                          durationMinutes: exam.duration,
                          attemptCompletedAt: exam.completedAt,
                          attemptStatus: exam.status,
                      }),
        };
    }

    return {
        ...exam,
        status: resolveStudentExamStatus({
            status: exam.status,
            scheduledDate: exam.scheduledDate,
            endDateTime: exam.endDateTime,
            durationMinutes: exam.duration,
            attemptCompletedAt: exam.completedAt,
            attemptStatus: exam.status === 'in-progress' ? 'in-progress' : null,
        }),
    };
}
