import { resolveStudentExamStatus } from '@sentinel/shared';
import type { ProctorExam } from '@sentinel/shared/types';

const STUDENT_EXAM_STATUSES = new Set([
    'available',
    'upcoming',
    'in-progress',
    'turned_in',
    'past_due',
    'archived',
    'scheduled',
    'completed',
]);

/**
 * Normalizes student-facing exam statuses when upstream responses still carry
 * instructor/internal values such as "published".
 */
export function normalizeStudentExam(exam: ProctorExam): ProctorExam {
    if (STUDENT_EXAM_STATUSES.has(exam.status)) {
        return exam;
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
