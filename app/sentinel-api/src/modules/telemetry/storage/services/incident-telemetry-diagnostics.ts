import type { PersistableProctoringEvent } from '../../ingestion/ingestion.dto';

/**
 * The persistence outcome recorded for one telemetry ingestion attempt.
 */
export type IncidentTelemetryDiagnosticDisposition =
    | 'inserted'
    | 'aggregated'
    | 'duplicate-ignored';

/**
 * Structured development diagnostic for telemetry persistence.
 */
export type IncidentTelemetryDiagnostic = {
    disposition: IncidentTelemetryDiagnosticDisposition;
    attemptId: string;
    incidentId?: string;
    ruleKey: PersistableProctoringEvent['ruleKey'];
    platform: PersistableProctoringEvent['platform'];
    eventType: PersistableProctoringEvent['eventType'];
    dedupeKey?: string;
    eventId?: string;
    occurrenceCount: number;
};

/**
 * Writes one structured persistence diagnostic in development.
 *
 * @param diagnostic The diagnostic payload to emit.
 * @returns The emitted diagnostic, or null outside development.
 */
export function writeIncidentTelemetryDiagnostic(
    diagnostic: IncidentTelemetryDiagnostic,
): IncidentTelemetryDiagnostic | null {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    console.info('[TelemetryStorage][Diagnostics]', diagnostic);
    return diagnostic;
}
