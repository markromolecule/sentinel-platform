import { type DbClient } from '@sentinel/db';
import type {
    ExamAttemptLifecycleEvent,
    ExamAttemptLifecycleEventType,
    ExamAttemptLifecycleState,
} from '@sentinel/shared';

function toLifecycleEvent(record: {
    event_id: string;
    attempt_id: string;
    exam_id: string;
    student_id: string;
    event_type: ExamAttemptLifecycleEventType;
    previous_state: ExamAttemptLifecycleState | null;
    next_state: ExamAttemptLifecycleState | null;
    actor_user_id: string | null;
    reason_code: string | null;
    notes: string | null;
    related_incident_ids: unknown | null;
    related_override_id: string | null;
    metadata: unknown | null;
    created_at: Date | string | null;
}): ExamAttemptLifecycleEvent {
    return {
        eventId: record.event_id,
        attemptId: record.attempt_id,
        examId: record.exam_id,
        studentId: record.student_id,
        eventType: record.event_type,
        previousState: record.previous_state,
        nextState: record.next_state,
        actorUserId: record.actor_user_id,
        reasonCode: record.reason_code,
        notes: record.notes,
        relatedIncidentIds: Array.isArray(record.related_incident_ids)
            ? (record.related_incident_ids as string[])
            : null,
        relatedOverrideId: record.related_override_id,
        metadata:
            record.metadata && typeof record.metadata === 'object'
                ? (record.metadata as Record<string, unknown>)
                : null,
        createdAt:
            record.created_at instanceof Date
                ? record.created_at.toISOString()
                : (record.created_at ?? null),
    };
}

/**
 * Persists one immutable audit event for an exam attempt lifecycle transition.
 */
export async function appendExamAttemptLifecycleEvent(args: {
    dbClient: DbClient;
    attemptId: string;
    examId: string;
    studentId: string;
    eventType: ExamAttemptLifecycleEventType;
    previousState: ExamAttemptLifecycleState | null;
    nextState: ExamAttemptLifecycleState | null;
    actorUserId?: string | null;
    reasonCode?: string | null;
    notes?: string | null;
    relatedIncidentIds?: string[] | null;
    relatedOverrideId?: string | null;
    metadata?: Record<string, unknown> | null;
}): Promise<ExamAttemptLifecycleEvent> {
    const insertedEvent = await args.dbClient
        .insertInto('exam_attempt_lifecycle_events')
        .values({
            attempt_id: args.attemptId,
            exam_id: args.examId,
            student_id: args.studentId,
            event_type: args.eventType,
            previous_state: args.previousState,
            next_state: args.nextState,
            actor_user_id: args.actorUserId ?? null,
            reason_code: args.reasonCode ?? null,
            notes: args.notes ?? null,
            related_incident_ids: args.relatedIncidentIds
                ? JSON.stringify(args.relatedIncidentIds)
                : null,
            related_override_id: args.relatedOverrideId ?? null,
            metadata: args.metadata ? JSON.stringify(args.metadata) : null,
            created_at: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

    return toLifecycleEvent(insertedEvent as any);
}
