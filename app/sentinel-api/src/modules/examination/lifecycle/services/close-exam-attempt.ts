import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

/**
 * Closes one exam attempt without altering its captured answer snapshot.
 */
export async function closeExamAttempt(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
    reasonCode: string;
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
        nextState: 'CLOSED',
        eventType: 'CLOSED',
    });

    const closedAt = new Date();

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            lifecycle_state: 'CLOSED',
            lifecycle_reason: args.reasonCode,
            lifecycle_note: args.notes ?? null,
            closed_at: closedAt,
            closed_by: args.actorUserId ?? null,
            closed_reason: args.reasonCode,
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'CLOSED',
        previousState: context.attempt.lifecycleState,
        nextState: 'CLOSED',
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode,
        notes: args.notes ?? null,
    });

    return {
        attempt: {
            ...context.attempt,
            lifecycleState: 'CLOSED',
            lifecycleReason: args.reasonCode,
            lifecycleNote: args.notes ?? null,
            closedAt: closedAt.toISOString(),
            closedBy: args.actorUserId ?? null,
            closedReason: args.reasonCode,
            events: [latestEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
