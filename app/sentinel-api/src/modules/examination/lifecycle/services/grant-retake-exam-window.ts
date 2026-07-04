import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';
import { recordAttemptLifecycleAudit } from './lifecycle-audit.service';

/**
 * Grants a retake window for one student and records the grant against the
 * original attempt so audit history stays attached to the source evidence.
 */
export async function grantRetakeExamWindow(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    sourceAttemptId: string;
    availableFrom: string | Date;
    availableUntil: string | Date;
    allowedAttempts?: number;
    notes?: string | null;
    actorUserId?: string | null;
    institutionId?: string;
}) {
    const context = await getLifecycleAttemptContext({
        dbClient: args.dbClient,
        examId: args.examId,
        attemptId: args.sourceAttemptId,
        institutionId: args.institutionId,
    });

    if (!context || context.student.id !== args.studentId) {
        throw new HTTPException(404, {
            message: 'The selected source attempt does not belong to this student and exam.',
        });
    }

    transitionExamAttemptLifecycle({
        currentState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        eventType: 'RETAKE_GRANTED',
    });

    const override = await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: args.dbClient,
        examId: args.examId,
        body: {
            studentId: args.studentId,
            overrideType: 'RETAKE',
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
            allowedAttempts: args.allowedAttempts ?? 1,
            sourceAttemptId: args.sourceAttemptId,
            notes: args.notes ?? null,
        },
        grantedBy: args.actorUserId ?? null,
    });

    const latestEvent = await appendExamAttemptLifecycleEvent({
        dbClient: args.dbClient,
        attemptId: args.sourceAttemptId,
        examId: args.examId,
        studentId: args.studentId,
        eventType: 'RETAKE_GRANTED',
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        actorUserId: args.actorUserId ?? null,
        reasonCode: 'RETAKE_GRANTED',
        notes: args.notes ?? null,
        relatedOverrideId: override.id,
    });

    const resolvedInstId = args.institutionId || context.exam?.institutionId || '';

    await recordAttemptLifecycleAudit({
        dbClient: args.dbClient,
        attemptId: args.sourceAttemptId,
        examId: args.examId,
        studentId: args.studentId,
        eventType: 'RETAKE_GRANTED',
        actorUserId: args.actorUserId ?? null,
        institutionId: resolvedInstId || null,
        reasonCode: 'RETAKE_GRANTED',
        notes: args.notes ?? null,
        previousState: context.attempt.lifecycleState,
        nextState: context.attempt.lifecycleState,
        relatedOverrideId: override.id,
        details: {
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
            allowedAttempts: args.allowedAttempts ?? 1,
        },
    });

    return {
        override,
        latestEvent,
    };
}
