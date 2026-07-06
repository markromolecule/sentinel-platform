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
 * attempt close. Reads the exam-specific automatic close configuration, applying
 * the configured highIncidentThreshold, windowMinutes, useOccurrenceCount,
 * and immediateCloseEventTypes.
 * 
 * @param args - Arguments including the DB client, target attempt ID, and optional triggering event type.
 * @returns Decision on whether to close the attempt and associated metadata.
 */
export async function resolveAutomaticLifecyclePolicy(args: {
    dbClient: DbClient;
    attemptId: string;
    triggeringEventType?: string;
}): Promise<AutomaticLifecycleResolution> {
    const attempt = await args.dbClient
        .selectFrom('exam_attempts')
        .leftJoin('exam_configurations', 'exam_configurations.exam_id', 'exam_attempts.exam_id')
        .select([
            'exam_attempts.attempt_id',
            'exam_attempts.exam_id',
            'exam_attempts.lifecycle_state',
            'exam_configurations.ai_rules',
        ])
        .where('exam_attempts.attempt_id', '=', args.attemptId)
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

    // Parse policy from ai_rules JSON
    const aiRules = attempt.ai_rules ? (attempt.ai_rules as any) : null;
    const policy = aiRules?.automaticClosePolicy || {};

    const policyEnabled = policy.enabled !== false; // defaults to true
    if (!policyEnabled) {
        return {
            action: 'NONE',
            attemptId: args.attemptId,
            matchingIncidentIds: [],
        };
    }

    const highIncidentThreshold = policy.highIncidentThreshold ?? AUTOMATIC_ATTEMPT_CLOSE_POLICY.thresholdCount;
    const windowMinutes = policy.windowMinutes ?? AUTOMATIC_ATTEMPT_CLOSE_POLICY.windowMinutes;
    const useOccurrenceCount = policy.useOccurrenceCount === true;
    const immediateCloseEventTypes = policy.immediateCloseEventTypes || [];

    // Check if the triggering event causes an immediate close
    if (args.triggeringEventType && immediateCloseEventTypes.includes(args.triggeringEventType)) {
        return {
            action: 'CLOSE_ATTEMPT',
            attemptId: args.attemptId,
            examId: attempt.exam_id,
            reasonCode: 'AUTO_IMMEDIATE_CLOSE_EVENT',
            notes: `Automatically closed immediately due to event type "${args.triggeringEventType}".`,
            matchingIncidentIds: [],
        };
    }

    const threshold = new Date(
        Date.now() - windowMinutes * 60 * 1000,
    );
    const highIncidents = await args.dbClient
        .selectFrom('flagged_incidents')
        .select(['incident_id', 'details'])
        .where('attempt_id', '=', args.attemptId)
        .where('severity', '=', 'HIGH')
        .where('timestamp', '>=', threshold)
        .orderBy('timestamp', 'asc')
        .execute();

    let totalOccurrences = 0;
    const matchingIncidentIds: string[] = [];

    for (const incident of highIncidents) {
        matchingIncidentIds.push(incident.incident_id);
        if (useOccurrenceCount) {
            const details = incident.details as any;
            const count = typeof details?.occurrenceCount === 'number'
                ? details.occurrenceCount
                : 1;
            totalOccurrences += count;
        } else {
            totalOccurrences += 1;
        }
    }

    if (totalOccurrences < highIncidentThreshold) {
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
        notes: useOccurrenceCount
            ? `Automatically closed after ${totalOccurrences} occurrences of HIGH incidents within ${windowMinutes} minutes.`
            : `Automatically closed after ${matchingIncidentIds.length} HIGH incidents within ${windowMinutes} minutes.`,
        matchingIncidentIds,
    };
}
