import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';
import { recordAttemptLifecycleAudit } from './lifecycle-audit.service';

/**
 * Locks one attempt in place and records the change in the lifecycle audit log.
 */
export async function lockExamAttempt(args: {
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
        nextState: 'LOCKED',
        eventType: 'LOCKED',
    });

    const lockedAt = new Date();

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            lifecycle_state: 'LOCKED',
            lifecycle_reason: args.reasonCode,
            lifecycle_note: args.notes ?? null,
            locked_at: lockedAt,
            locked_by: args.actorUserId ?? null,
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'LOCKED',
        previousState: context.attempt.lifecycleState,
        nextState: 'LOCKED',
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode,
        notes: args.notes ?? null,
        relatedIncidentIds: context.incidents.map((incident) => incident.incidentId),
    });

    const resolvedInstId = args.institutionId || context.exam.institutionId || '';

    await recordAttemptLifecycleAudit({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'LOCKED',
        actorUserId: args.actorUserId ?? null,
        institutionId: resolvedInstId || null,
        reasonCode: args.reasonCode,
        notes: args.notes ?? null,
        previousState: context.attempt.lifecycleState,
        nextState: 'LOCKED',
        relatedIncidentIds: context.incidents.map((incident) => incident.incidentId),
    });

    return {
        attempt: {
            ...context.attempt,
            lifecycleState: 'LOCKED',
            lifecycleReason: args.reasonCode,
            lifecycleNote: args.notes ?? null,
            lockedAt: lockedAt.toISOString(),
            lockedBy: args.actorUserId ?? null,
            events: [latestEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
