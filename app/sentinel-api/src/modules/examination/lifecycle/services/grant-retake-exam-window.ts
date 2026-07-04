import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { transitionExamAttemptLifecycle } from './lifecycle-transition.service';
import { recordAttemptLifecycleAudit } from './lifecycle-audit.service';
import { createRemediationExam } from './create-remediation-exam';

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

    const remediation = await createRemediationExam({
        dbClient: args.dbClient,
        sourceExamId: args.examId,
        studentId: args.studentId,
        sourceAttemptId: args.sourceAttemptId,
        remediationType: 'RETAKE',
        scheduledDate: args.availableFrom,
        endDate: args.availableUntil,
        createdBy: args.actorUserId || '00000000-0000-0000-0000-000000000000',
        notes: args.notes,
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
        relatedOverrideId: null,
        metadata: {
            remediationExamId: remediation.remediationExam.exam_id,
            remediationId: remediation.remediationSchedule.remediation_id,
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
        },
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
        relatedOverrideId: null,
        details: {
            remediationExamId: remediation.remediationExam.exam_id,
            remediationId: remediation.remediationSchedule.remediation_id,
            availableFrom: args.availableFrom,
            availableUntil: args.availableUntil,
        },
    });

    return {
        remediationExam: {
            examId: remediation.remediationExam.exam_id,
            title: remediation.remediationExam.title,
            scheduledDate: remediation.remediationExam.scheduled_date!,
            endDateTime: remediation.remediationExam.end_date_time!,
            status: remediation.remediationExam.status!,
        },
        remediationSchedule: {
            remediationId: remediation.remediationSchedule.remediation_id,
            sourceExamId: remediation.remediationSchedule.source_exam_id,
            remediationExamId: remediation.remediationSchedule.remediation_exam_id,
            studentId: remediation.remediationSchedule.student_id,
            sourceAttemptId: remediation.remediationSchedule.source_attempt_id,
            remediationType: remediation.remediationSchedule.remediation_type,
            scheduledDate: remediation.remediationSchedule.scheduled_date,
            endDateTime: remediation.remediationSchedule.end_date_time,
            createdBy: remediation.remediationSchedule.created_by,
            createdAt: remediation.remediationSchedule.created_at,
            notes: remediation.remediationSchedule.notes,
        },
        override: null,
        latestEvent,
    };
}
