import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleResponseType } from '@sentinel/shared';
import { HTTPException } from 'hono/http-exception';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

function resolveResetWindow(args: {
    endDateTime?: string | null;
    durationMinutes?: number;
}) {
    const now = new Date();
    const endDateTime = args.endDateTime ? new Date(args.endDateTime) : null;

    if (endDateTime && !Number.isNaN(endDateTime.getTime()) && endDateTime.getTime() > now.getTime()) {
        return {
            availableFrom: now.toISOString(),
            availableUntil: endDateTime.toISOString(),
        };
    }

    return {
        availableFrom: now.toISOString(),
        availableUntil: new Date(
            now.getTime() + Math.max(args.durationMinutes ?? 60, 15) * 60 * 1000,
        ).toISOString(),
    };
}

/**
 * Supersedes the current attempt and creates a one-time retake window for a replacement attempt.
 */
export async function resetExamAttempt(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
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
        nextState: context.attempt.lifecycleState,
        eventType: 'RESET',
    });

    transitionExamAttemptLifecycle({
        currentState: context.attempt.lifecycleState,
        nextState: 'SUPERSEDED',
        eventType: 'SUPERSEDED',
    });

    const supersededAt = new Date();

    await args.dbClient
        .updateTable('exam_attempts')
        .set({
            lifecycle_state: 'SUPERSEDED',
            lifecycle_reason: args.reasonCode ?? 'ATTEMPT_RESET',
            lifecycle_note: args.notes ?? null,
            superseded_at: supersededAt,
            superseded_by: args.actorUserId ?? null,
        })
        .where('attempt_id', '=', args.attemptId)
        .where('exam_id', '=', args.examId)
        .executeTakeFirst();

    const resetEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'RESET',
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode ?? 'ATTEMPT_RESET',
        notes: args.notes ?? null,
    });

    const overrideWindow = resolveResetWindow({
        endDateTime: context.exam.endDateTime,
        durationMinutes: context.exam.durationMinutes,
    });

    await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: args.dbClient,
        examId: args.examId,
        body: {
            studentId: context.student.id,
            overrideType: 'RETAKE',
            availableFrom: overrideWindow.availableFrom,
            availableUntil: overrideWindow.availableUntil,
            allowedAttempts: 1,
            sourceAttemptId: args.attemptId,
            notes: args.notes ?? 'Attempt reset replacement window.',
        },
        grantedBy: args.actorUserId ?? null,
    });

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.attemptId,
        examId: args.examId,
        studentId: context.student.id,
        eventType: 'SUPERSEDED',
        previousState: context.attempt.lifecycleState,
        nextState: 'SUPERSEDED',
        actorUserId: args.actorUserId ?? null,
        reasonCode: args.reasonCode ?? 'ATTEMPT_RESET',
        notes: args.notes ?? null,
    });

    return {
        attempt: {
            ...context.attempt,
            lifecycleState: 'SUPERSEDED',
            lifecycleReason: args.reasonCode ?? 'ATTEMPT_RESET',
            lifecycleNote: args.notes ?? null,
            supersededAt: supersededAt.toISOString(),
            supersededBy: args.actorUserId ?? null,
            events: [latestEvent, resetEvent, ...(context.attempt.events ?? [])],
        },
        latestEvent,
    };
}
