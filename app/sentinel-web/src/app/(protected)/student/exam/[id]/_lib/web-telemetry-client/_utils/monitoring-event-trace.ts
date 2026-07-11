import type { BrowserTelemetryEventType, MediaPipeTelemetryEventType } from '../_types';

/**
 * The lifecycle stage recorded for one monitoring event attempt.
 */
export type MonitoringEventTraceDisposition = 'suppressed' | 'emitting' | 'accepted' | 'failed';

/**
 * Structured development trace for one monitoring event.
 */
export type MonitoringEventTrace = {
    detectorSource: string;
    eventType: BrowserTelemetryEventType | MediaPipeTelemetryEventType;
    eventSubtype?: string;
    eventId?: string;
    dedupeKey?: string;
    detectionTime: string;
    emissionTime?: string;
    disposition: MonitoringEventTraceDisposition;
    reason?: string;
    developmentContext?: Record<string, unknown>;
};

declare global {
    var __SENTINEL_MONITORING_EVENT_TRACES__: MonitoringEventTrace[] | undefined;
}

/**
 * Returns the shared development trace buffer for monitoring events.
 *
 * @returns The in-memory trace buffer when development diagnostics are enabled.
 */
export function getMonitoringEventTraceBuffer(): MonitoringEventTrace[] | null {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    if (!globalThis.__SENTINEL_MONITORING_EVENT_TRACES__) {
        globalThis.__SENTINEL_MONITORING_EVENT_TRACES__ = [];
    }

    return globalThis.__SENTINEL_MONITORING_EVENT_TRACES__;
}

/**
 * Records one monitoring trace entry in development builds.
 *
 * @param trace The trace payload to append.
 * @returns The appended trace entry, or null outside development.
 */
export function writeMonitoringEventTrace(
    trace: MonitoringEventTrace,
): MonitoringEventTrace | null {
    const buffer = getMonitoringEventTraceBuffer();

    if (!buffer) {
        return null;
    }

    const entry = { ...trace };
    buffer.push(entry);
    return entry;
}
