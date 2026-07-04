import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';

/**
 * Grants a makeup window for one student and optionally links it back to a
 * source attempt without mutating that attempt's lifecycle state.
 */
export async function grantMakeupExamWindow(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    availableFrom: string | Date;
    availableUntil: string | Date;
    allowedAttempts?: number;
    sourceAttemptId?: string | null;
    notes?: string | null;
    actorUserId?: string | null;
    institutionId?: string;
}) {
    let latestEvent = null;

    if (args.sourceAttemptId) {
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
            eventType: 'MAKEUP_GRANTED',
        });
    }

    const override = await StudentOverridesService.createStudentExamAccessOverride({
        dbClient: args.dbClient,
        examId: args.examId,
        body: {
            studentId: args.studentId,
            overrideType: 'MAKEUP',
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
            allowedAttempts: args.allowedAttempts ?? 1,
            sourceAttemptId: args.sourceAttemptId ?? null,
            notes: args.notes ?? null,
        },
        grantedBy: args.actorUserId ?? null,
    });

    if (args.sourceAttemptId) {
        const context = await getLifecycleAttemptContext({
            dbClient: args.dbClient,
            examId: args.examId,
            attemptId: args.sourceAttemptId,
            institutionId: args.institutionId,
        });

        if (!context) {
            throw new HTTPException(404, {
                message: 'Exam attempt not found for this exam.',
            });
        }

        latestEvent = await appendExamAttemptLifecycleEvent({
            dbClient: args.dbClient,
            attemptId: args.sourceAttemptId,
            examId: args.examId,
            studentId: args.studentId,
            eventType: 'MAKEUP_GRANTED',
            previousState: context.attempt.lifecycleState,
            nextState: context.attempt.lifecycleState,
            actorUserId: args.actorUserId ?? null,
            reasonCode: 'MAKEUP_GRANTED',
            notes: args.notes ?? null,
            relatedOverrideId: override.id,
        });
    }

    return {
        override,
        latestEvent,
    };
}
