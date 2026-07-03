import { type DbClient } from '@sentinel/db';
import type {
    ExamAttemptLifecycleEvent,
    ExamAttemptLifecycleSnapshot,
    ExamAttemptLifecycleState,
    ExamAttemptScoreState,
} from '@sentinel/shared';

export type LifecycleAttemptContext = {
    attempt: ExamAttemptLifecycleSnapshot;
    exam: {
        id: string;
        institutionId: string | null;
        scheduledDate: string | null;
        endDateTime: string | null;
        durationMinutes: number;
    };
    student: {
        id: string;
    };
    incidents: Array<{
        incidentId: string;
        attemptId: string | null;
        severity: string | null;
        status: string | null;
        timestamp: string | null;
    }>;
};

function toIsoString(value?: Date | string | null) {
    if (!value) {
        return null;
    }

    return value instanceof Date ? value.toISOString() : value;
}

function toLifecycleEvent(record: {
    event_id: string;
    attempt_id: string;
    exam_id: string;
    student_id: string;
    event_type: string;
    previous_state: string | null;
    next_state: string | null;
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
        eventType: record.event_type as ExamAttemptLifecycleEvent['eventType'],
        previousState: record.previous_state as ExamAttemptLifecycleState | null,
        nextState: record.next_state as ExamAttemptLifecycleState | null,
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
        createdAt: toIsoString(record.created_at),
    };
}

/**
 * Loads the full attempt context required for lifecycle transitions, including
 * the persisted lifecycle snapshot and recent incident evidence.
 */
export async function getLifecycleAttemptContext(args: {
    dbClient: DbClient;
    examId: string;
    attemptId: string;
    institutionId?: string;
}): Promise<LifecycleAttemptContext | null> {
    let query = args.dbClient
        .selectFrom('exam_attempts as ea')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            'ea.attempt_id',
            'ea.exam_id',
            'ea.student_id',
            'ea.lifecycle_state',
            'ea.lifecycle_reason',
            'ea.lifecycle_note',
            'ea.locked_at',
            'ea.locked_by',
            'ea.reopened_until',
            'ea.closed_at',
            'ea.closed_by',
            'ea.closed_reason',
            'ea.superseded_by_attempt_id',
            'ea.superseded_at',
            'ea.superseded_by',
            'ea.finalized_at',
            'ea.finalized_by',
            'ea.score_state',
            'e.institution_id',
            'e.scheduled_date',
            'e.end_date_time',
            'e.duration_minutes',
        ])
        .where('ea.attempt_id', '=', args.attemptId)
        .where('ea.exam_id', '=', args.examId);

    if (args.institutionId) {
        query = query.where('e.institution_id', '=', args.institutionId);
    }

    const attemptRow = await query.executeTakeFirst();

    if (!attemptRow || !attemptRow.student_id) {
        return null;
    }

    const [eventRows, incidentRows] = await Promise.all([
        args.dbClient
            .selectFrom('exam_attempt_lifecycle_events')
            .selectAll()
            .where('attempt_id', '=', args.attemptId)
            .orderBy('created_at', 'desc')
            .execute(),
        args.dbClient
            .selectFrom('flagged_incidents')
            .select(['incident_id', 'attempt_id', 'severity', 'status', 'timestamp'])
            .where('attempt_id', '=', args.attemptId)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .execute(),
    ]);

    return {
        attempt: {
            attemptId: attemptRow.attempt_id,
            examId: attemptRow.exam_id ?? args.examId,
            studentId: attemptRow.student_id,
            lifecycleState:
                (attemptRow.lifecycle_state as ExamAttemptLifecycleState | null) ?? 'IN_PROGRESS',
            lifecycleReason: attemptRow.lifecycle_reason ?? null,
            lifecycleNote: attemptRow.lifecycle_note ?? null,
            lockedAt: toIsoString(attemptRow.locked_at),
            lockedBy: attemptRow.locked_by ?? null,
            reopenedUntil: toIsoString(attemptRow.reopened_until),
            closedAt: toIsoString(attemptRow.closed_at),
            closedBy: attemptRow.closed_by ?? null,
            closedReason: attemptRow.closed_reason ?? null,
            supersededByAttemptId: attemptRow.superseded_by_attempt_id ?? null,
            supersededAt: toIsoString(attemptRow.superseded_at),
            supersededBy: attemptRow.superseded_by ?? null,
            finalizedAt: toIsoString(attemptRow.finalized_at),
            finalizedBy: attemptRow.finalized_by ?? null,
            scoreState: (attemptRow.score_state as ExamAttemptScoreState | null) ?? 'DRAFT',
            events: eventRows.map((row) => toLifecycleEvent(row as any)),
        },
        exam: {
            id: attemptRow.exam_id ?? args.examId,
            institutionId: attemptRow.institution_id ?? null,
            scheduledDate: toIsoString(attemptRow.scheduled_date),
            endDateTime: toIsoString(attemptRow.end_date_time),
            durationMinutes: attemptRow.duration_minutes ?? 0,
        },
        student: {
            id: attemptRow.student_id,
        },
        incidents: incidentRows.map((row) => ({
            incidentId: row.incident_id,
            attemptId: row.attempt_id,
            severity: row.severity ?? null,
            status: row.status ?? null,
            timestamp: toIsoString(row.timestamp),
        })),
    };
}
