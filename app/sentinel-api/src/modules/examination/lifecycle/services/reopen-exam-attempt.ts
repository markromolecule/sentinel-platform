import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

/**
 * Reopens a previously locked or closed attempt and captures the allowed reopen window.
 */
export async function reopenExamAttempt(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
    reopenedUntil: string | Date;
    reasonCode?: string | null;
    notes?: string | null;
    actorUserId?: string | null;
    institutionId?: string;
}): Promise<ExamAttemptLifecycleResponseType> {
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

    transitionExamAttemptLifecycle({
        currentState: context.attempt.lifecycleState,
        nextState: 'IN_PROGRESS',
        eventType: 'REOPENED',
    });

    const reopenedUntil = new Date(args.reopenedUntil);

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            lifecycle_state: 'IN_PROGRESS',
            lifecycle_reason: args.reasonCode ?? null,
            lifecycle_note: args.notes ?? null,
            reopened_until: reopenedUntil,
            closed_at: null,
            closed_by: null,
            closed_reason: null,
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'REOPENED',
        previousState: context.attempt.lifecycleState,
        nextState: 'IN_PROGRESS',
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode ?? null,
        notes: args.notes ?? null,
    });

    return {
        attempt: {
            ...context.attempt,
            lifecycleState: 'IN_PROGRESS',
            lifecycleReason: args.reasonCode ?? null,
            lifecycleNote: args.notes ?? null,
            reopenedUntil: reopenedUntil.toISOString(),
            closedAt: null,
            closedBy: null,
            closedReason: null,
            events: [latestEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
