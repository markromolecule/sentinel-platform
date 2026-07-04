import { type DbClient } from '@sentinel/db';
import { AUTOMATIC_ATTEMPT_CLOSE_POLICY } from '../lifecycle.constants';

export type AutomaticLifecycleResolution =
    | {
          action: 'NONE';
          attemptId: string;
          matchingIncidentIds: string[];
      }
    | {
          action: 'CLOSE_ATTEMPT';
          attemptId: string;
          examId: string;
          reasonCode: string;
          notes: string;
          matchingIncidentIds: string[];
      };

/**
 * Resolves whether a persisted incident update should trigger an automatic
 * attempt close. Future work can move the threshold and window into
 * exam-specific configuration instead of relying on a system constant.
 */
export async function resolveAutomaticLifecyclePolicy(args: {
    dbClient: DbClient;
    attemptId: string;
}): Promise<AutomaticLifecycleResolution> {
    const attempt = await args.dbClient
        .selectFrom('exam_attempts')
        .select(['attempt_id', 'exam_id', 'lifecycle_state'])
        .where('attempt_id', '=', args.attemptId)
        .executeTakeFirst();

    if (
        !attempt ||
        !attempt.exam_id ||
        !['IN_PROGRESS', 'LOCKED', 'SUBMITTED'].includes(attempt.lifecycle_state ?? '')
    ) {
        return {
            action: 'NONE',
            attemptId: args.attemptId,
            matchingIncidentIds: [],
        };
    }

    const threshold = new Date(
        Date.now() - AUTOMATIC_ATTEMPT_CLOSE_POLICY.windowMinutes * 60 * 1000,
    );
    const highIncidents = await args.dbClient
        .selectFrom('flagged_incidents')
        .select(['incident_id'])
        .where('attempt_id', '=', args.attemptId)
        .where('severity', '=', 'HIGH')
        .where('timestamp', '>=', threshold)
        .orderBy('timestamp', 'asc')
        .execute();

    const matchingIncidentIds = highIncidents.map((incident) => incident.incident_id);

    if (matchingIncidentIds.length < AUTOMATIC_ATTEMPT_CLOSE_POLICY.thresholdCount) {
        return {
            action: 'NONE',
            attemptId: args.attemptId,
            matchingIncidentIds,
        };
    }

    return {
        action: 'CLOSE_ATTEMPT',
        attemptId: args.attemptId,
        examId: attempt.exam_id,
        reasonCode: AUTOMATIC_ATTEMPT_CLOSE_POLICY.reasonCode,
        notes: `Automatically closed after ${AUTOMATIC_ATTEMPT_CLOSE_POLICY.thresholdCount} HIGH incidents within ${AUTOMATIC_ATTEMPT_CLOSE_POLICY.windowMinutes} minutes.`,
        matchingIncidentIds,
    };
}
