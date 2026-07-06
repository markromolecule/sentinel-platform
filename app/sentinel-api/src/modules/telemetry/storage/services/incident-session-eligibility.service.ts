import type { DbClient } from '@sentinel/db';
import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import type { IngestSessionType } from './incident-persistence.types';

type EligibilityFailure = {
    ok: false;
    errorType: 403 | 404 | 409 | 'IGNORE_SILENTLY';
    message: string;
};

type EligibilitySuccess = {
    ok: true;
    session: IngestSessionType;
};

export type SessionEligibilityResult = EligibilityFailure | EligibilitySuccess;

const TELEMETRY_GRACE_PERIOD_MS = 5 * 60 * 1000;

export async function fetchTelemetryIngestSession(
    db: DbClient,
    examSessionId: string,
): Promise<IngestSessionType | undefined> {
    const session = await db
        .selectFrom('exam_attempts as ea')
        .innerJoin('students as s', 's.student_id', 'ea.student_id')
        .select(['ea.attempt_id', 'ea.completed_at', 'ea.status', 's.user_id', 's.institution_id'])
        .where('ea.attempt_id', '=', examSessionId)
        .executeTakeFirst();

    if (!session?.user_id) {
        return undefined;
    }

    return {
        attempt_id: session.attempt_id,
        completed_at: session.completed_at,
        status: session.status,
        user_id: session.user_id,
        institution_id: session.institution_id,
    };
}

export function checkTelemetrySessionEligibility(
    session: IngestSessionType,
    payload: Pick<PersistableProctoringEvent, 'studentId' | 'eventType'>,
): SessionEligibilityResult {
    if (session.user_id !== payload.studentId) {
        return {
            ok: false,
            errorType: 403,
            message: 'Telemetry payload does not belong to the current exam session.',
        };
    }

    const isCompletedSession = Boolean(session.completed_at || session.status === 'COMPLETED');

    if (isCompletedSession && payload.eventType === 'FULL_SCREEN_EXIT') {
        return {
            ok: false,
            errorType: 'IGNORE_SILENTLY',
            message: 'Ignoring post-completion fullscreen telemetry',
        };
    }

    const isRecentlyCompleted =
        session.completed_at &&
        Date.now() - new Date(session.completed_at).getTime() < TELEMETRY_GRACE_PERIOD_MS;

    if (isCompletedSession && !isRecentlyCompleted) {
        return {
            ok: false,
            errorType: 409,
            message: 'Cannot ingest telemetry for a completed exam session (grace period expired).',
        };
    }

    return { ok: true, session };
}

export async function resolveTelemetrySessionEligibility(
    db: DbClient,
    payload: Pick<PersistableProctoringEvent, 'examSessionId' | 'studentId' | 'eventType'>,
): Promise<SessionEligibilityResult> {
    const session = await fetchTelemetryIngestSession(db, payload.examSessionId);

    if (!session) {
        return {
            ok: false,
            errorType: 404,
            message: 'Exam session not found for telemetry ingestion.',
        };
    }

    return checkTelemetrySessionEligibility(session, payload);
}
