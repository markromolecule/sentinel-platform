import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';
import { recordAttemptLifecycleAudit } from './lifecycle-audit.service';

/**
 * Reopens score review for a finalized attempt while leaving runtime access unchanged.
 */
export async function reviseFinalizedAttemptScore(args: {
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

    if (context.attempt.scoreState !== 'FINALIZED') {
        throw new HTTPException(409, {
            message: 'Only finalized attempt scores can be revised.',
        });
    }

    transitionExamAttemptLifecycle({
        currentState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        eventType: 'FINALIZATION_REVISED',
    });

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            score_state: 'REVISION_REQUIRED',
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'FINALIZATION_REVISED',
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode,
        notes: args.notes ?? null,
    });

    const resolvedInstId = args.institutionId || context.exam.institutionId || '';

    await recordAttemptLifecycleAudit({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'FINALIZATION_REVISED',
        actorUserId: args.actorUserId ?? null,
        institutionId: resolvedInstId || null,
        reasonCode: args.reasonCode,
        notes: args.notes ?? null,
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
    });

    return {
        attempt: {
            ...context.attempt,
            scoreState: 'REVISION_REQUIRED',
            events: [latestEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
