import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    REMEDIATION_REQUIRES_EXAM_END_PASSED,
    ALLOW_MAKEUP_OVER_IN_PROGRESS,
} from '../lifecycle.constants';

export type AssertRemediationEligibilityArgs = {
    dbClient: DbClient;
    remediationType: 'MAKEUP' | 'RETAKE';
    examId: string;
    studentId: string;
    availableFrom: string | Date;
    availableUntil: string | Date;
    sourceAttemptId?: string | null;
};

/**
 * Asserts the eligibility of a student to receive a remediation (makeup or retake) exam window.
 *
 * @param args - The assertion arguments.
 * @throws {HTTPException} If the remediation window or attempt state is ineligible.
 */
export async function assertRemediationWindowEligibility(args: AssertRemediationEligibilityArgs): Promise<void> {
    const {
        dbClient,
        remediationType,
        examId,
        studentId,
        availableFrom,
        availableUntil,
        sourceAttemptId,
    } = args;

    const fromDate = new Date(availableFrom);
    const untilDate = new Date(availableUntil);

    // 1. Validate date order
    if (untilDate <= fromDate) {
        throw new HTTPException(400, {
            message: 'remediation availableUntil must be after availableFrom',
        });
    }

    // 2. Fetch the exam to check end date policy and existence
    const exam = await dbClient
        .selectFrom('exams')
        .select(['exam_id', 'end_date_time'])
        .where('exam_id', '=', examId)
        .executeTakeFirst();

    if (!exam) {
        throw new HTTPException(404, {
            message: 'Exam not found.',
        });
    }

    // 3. Enforce exam end date policy if required
    if (REMEDIATION_REQUIRES_EXAM_END_PASSED && exam.end_date_time) {
        const endTime = new Date(exam.end_date_time);
        if (endTime > new Date()) {
            throw new HTTPException(409, {
                message: 'Remediation can only be granted after the exam window has closed.',
            });
        }
    }

    // 4. Fetch existing attempts of the student for this exam
    const attempts = await dbClient
        .selectFrom('exam_attempts')
        .select(['attempt_id', 'lifecycle_state'])
        .where('exam_id', '=', examId)
        .where('student_id', '=', studentId)
        .execute();

    if (remediationType === 'RETAKE') {
        if (!sourceAttemptId) {
            throw new HTTPException(400, {
                message: 'A source attempt ID is required for a retake.',
            });
        }

        const sourceAttempt = attempts.find((a) => a.attempt_id === sourceAttemptId);
        if (!sourceAttempt) {
            throw new HTTPException(404, {
                message: 'The selected source attempt does not belong to this student and exam.',
            });
        }

        // Retakes require the source attempt to be SUBMITTED or CLOSED
        const eligibleStates = ['SUBMITTED', 'CLOSED'];
        if (!sourceAttempt.lifecycle_state || !eligibleStates.includes(sourceAttempt.lifecycle_state)) {
            throw new HTTPException(409, {
                message: 'Retakes can only be granted for submitted or closed attempts.',
            });
        }
    } else if (remediationType === 'MAKEUP') {
        // Makeups require no active non-superseded attempts (unless ALLOW_MAKEUP_OVER_IN_PROGRESS is true)
        const hasActiveNonSuperseded = attempts.some((a) => {
            if (ALLOW_MAKEUP_OVER_IN_PROGRESS) {
                // If allowed over in-progress, we only reject if they have a non-superseded SUBMITTED or CLOSED attempt
                return a.lifecycle_state === 'SUBMITTED' || a.lifecycle_state === 'CLOSED';
            }
            return a.lifecycle_state !== 'SUPERSEDED';
        });

        if (hasActiveNonSuperseded) {
            throw new HTTPException(409, {
                message: 'Student already has an active, non-superseded attempt for this exam.',
            });
        }
    }
}
