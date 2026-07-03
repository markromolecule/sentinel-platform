import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

/**
 * Marks the current attempt score as finalized without reopening access or changing ownership.
 */
export async function finalizeExamAttemptScore(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
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
        nextState: context.attempt.lifecycleState,
        eventType: 'FINALIZED',
    });

    const finalizedAt = new Date();

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            score_state: 'FINALIZED',
            finalized_at: finalizedAt,
            finalized_by: args.actorUserId ?? null,
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'FINALIZED',
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        actorUserId: args.actorUserId ?? null,
        notes: args.notes ?? null,
    });

    return {
        attempt: {
            ...context.attempt,
            scoreState: 'FINALIZED',
            finalizedAt: finalizedAt.toISOString(),
            finalizedBy: args.actorUserId ?? null,
            events: [latestEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
