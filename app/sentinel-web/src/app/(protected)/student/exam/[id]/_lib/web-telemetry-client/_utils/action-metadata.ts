import { type WebTelemetryEventType } from '../_types';

/**
 * Creates unique tracking metadata for a logical telemetry action.
 * Ensures the event has a stable event ID and deduplication key.
 *
 * @param eventType The type of telemetry event.
 * @returns An object with eventId, dedupeKey, and clientActionAt.
 */
export function createTelemetryActionMetadata(eventType: WebTelemetryEventType) {
    const eventId = crypto.randomUUID();
    const clientActionAt = new Date().toISOString();
    const dedupeKey = `${eventType}:${eventId}`;
    return {
        eventId,
        dedupeKey,
        clientActionAt,
    };
}
