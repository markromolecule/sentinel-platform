import type { ExamAccessEligibility } from '../access.dto';

/**
 * Validates remediation exam constraints.
 * Ensures the student user profile or student ID matches the linked remediation student.
 *
 * @param args - The remediation validation parameters.
 * @returns An eligibility result object.
 */
export function validateRemediationAccess(args: {
    resolvedExam: {
        remediation_id?: string | null;
        remediation_student_id?: string | null;
    };
    resolvedStudent: {
        user_id: string | null;
        student_id: string;
    };
    startsAt: Date | null;
    endsAt: Date | null;
}): { isEligible: true } | { isEligible: false; errorResponse: ExamAccessEligibility } {
    const { resolvedExam, resolvedStudent, startsAt, endsAt } = args;
    const isRemediationExam = Boolean(resolvedExam.remediation_id);
    const isLinkedRemediationStudent =
        resolvedExam.remediation_student_id === resolvedStudent.user_id ||
        resolvedExam.remediation_student_id === resolvedStudent.student_id;

    if (isRemediationExam && !isLinkedRemediationStudent) {
        return {
            isEligible: false,
            errorResponse: {
                isEligible: false,
                reason: 'This remediation exam is only available to the assigned student.',
                reasonCode: 'CLOSED',
                runtimeAccess: {
                    state: 'closed',
                    reasonCode: 'CLOSED',
                    message: 'This remediation exam is only available to the assigned student.',
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

    return { isEligible: true };
}
