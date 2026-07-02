/**
 * Builds the canonical student history URL for a completed exam attempt.
 *
 * @param attemptId - The persisted exam attempt identifier.
 * @returns Canonical student history attempt URL.
 */
export function buildStudentHistoryAttemptHref(attemptId: string) {
    return `/student/history/attempts/${attemptId}`;
}

/**
 * Builds the canonical student history URL for an exam without an attempt detail record.
 *
 * @param examId - The exam identifier.
 * @returns Canonical student history exam URL.
 */
export function buildStudentHistoryExamHref(examId: string) {
    return `/student/history/exams/${examId}`;
}

/**
 * Builds the safest student history destination from optional route identifiers.
 *
 * @param args - Optional attempt and exam identifiers.
 * @returns Attempt URL when present, exam URL when only exam id exists, or the history index.
 */
export function buildStudentHistoryFallbackHref(args: {
    attemptId?: string | null;
    examId?: string | null;
}) {
    if (args.attemptId) {
        return buildStudentHistoryAttemptHref(args.attemptId);
    }

    if (args.examId) {
        return buildStudentHistoryExamHref(args.examId);
    }

    return '/student/history';
}
