import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';

/**
 * Grants a reopen window tied to one locked or closed attempt so the student
 * can resume that exact attempt instead of starting a fresh one.
 */
export async function grantReopenAttemptWindow(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
    availableFrom: string | Date;
    availableUntil: string | Date;
    notes?: string | null;
    actorUserId?: string | null;
    institutionId?: string;
}) {
    const context = await getLifecycleAttemptContext({
        dbClient: args.dbClient,
        examId: args.examId,
        attemptId: args.attemptId,
        institutionId: args.institutionId,
    });

    if (!context) {
        throw new HTTPException(404, {
            message: 'Exam attempt not found for this exam.',
        });
    }

    if (
        context.attempt.lifecycleState !== 'LOCKED' &&
        context.attempt.lifecycleState !== 'CLOSED'
    ) {
        throw new HTTPException(409, {
            message: 'Only locked or closed attempts can receive a reopen window.',
        });
    }

    const override = await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: args.dbClient,
        examId: args.examId,
        body: {
            studentId: context.student.id,
            overrideType: 'REOPEN',
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
            allowedAttempts: 1,
            sourceAttemptId: args.attemptId,
            notes: args.notes ?? null,
        },
        grantedBy: args.actorUserId ?? null,
    });

    return {
        override,
        latestEvent: null,
    };
}
