import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';
import type { SeverityResolution } from './incident-severity-resolver.service';

export function parseIncidentDetails(details: unknown): Record<string, unknown> {
    if (!details) {
        return {};
    }

    if (typeof details === 'string') {
        try {
            const parsed = JSON.parse(details);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? (parsed as Record<string, unknown>)
                : {};
        } catch {
            return {};
        }
    }

    return typeof details === 'object' && !Array.isArray(details)
        ? (details as Record<string, unknown>)
        : {};
}

export function getNextOccurrenceCount(details: Record<string, unknown>): number {
    return (
        (typeof details.occurrenceCount === 'number' && details.occurrenceCount > 0
            ? details.occurrenceCount
            : 1) + 1
    );
}

export function buildIncidentDetails(args: {
    existingDetails?: Record<string, unknown>;
    insertDetails: Record<string, unknown>;
    occurrenceCount: number;
    severityResolution: SeverityResolution;
    previousSeverity: string | null;
    payload: PersistableProctoringEvent;
}): string {
    return JSON.stringify({
        ...(args.existingDetails ?? {}),
        ...args.insertDetails,
        occurrenceCount: args.occurrenceCount,
        severityReason: args.severityResolution.severityReason,
        severityInputs: args.severityResolution.severityInputs,
        previousSeverity: args.previousSeverity,
        currentSeverity: args.severityResolution.finalSeverity,
        lastEvent: {
            eventType: args.payload.eventType,
            timestamp: args.payload.timestamp,
            metadata: args.payload.metadata,
        },
    });
}
