import { type BrowserTelemetryEventType } from '../_types';

type CreateTelemetryActionMetadataArgs = {
    eventType: BrowserTelemetryEventType;
    examSessionId?: string;
    actionSource?: string;
    actionBucketId?: string;
    clientActionAt?: string;
    bucketMs?: number;
};

/**
 * Correlation metadata attached to one logical browser action.
 */
export type TelemetryActionMetadata = {
    eventId: string;
    dedupeKey: string;
    clientActionAt: string;
    detectionTimestamp: string;
    detectorSource: string;
    eventSubtype: string;
};

function normalizeActionSource(actionSource: string | undefined) {
    return (actionSource ?? 'generic-action')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toStableUuid(seed: string) {
    let hashA = 0x811c9dc5;
    let hashB = 0x811c9dc5;
    let hashC = 0x811c9dc5;
    let hashD = 0x811c9dc5;

    for (let index = 0; index < seed.length; index += 1) {
        const code = seed.charCodeAt(index);
        hashA = Math.imul(hashA ^ code, 0x01000193);
        hashB = Math.imul(hashB ^ (code + 17), 0x01000193);
        hashC = Math.imul(hashC ^ (code + 31), 0x01000193);
        hashD = Math.imul(hashD ^ (code + 47), 0x01000193);
    }

    const hex = [hashA, hashB, hashC, hashD]
        .map((part) => (part >>> 0).toString(16).padStart(8, '0'))
        .join('');

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        `4${hex.slice(13, 16)}`,
        `${((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
        hex.slice(20, 32),
    ].join('-');
}

/**
 * Creates unique tracking metadata for a logical telemetry action.
 * Ensures the event has a stable event ID and deduplication key.
 *
 * @param eventType The type of telemetry event.
 * @returns An object with eventId, dedupeKey, and clientActionAt.
 */
export function createTelemetryActionMetadata(
    args: BrowserTelemetryEventType | CreateTelemetryActionMetadataArgs,
) {
    const {
        eventType,
        examSessionId,
        actionSource,
        actionBucketId,
        clientActionAt = new Date().toISOString(),
        bucketMs = 1000,
    } = typeof args === 'string' ? { eventType: args } : args;
    const normalizedActionSource = normalizeActionSource(actionSource);
    const normalizedActionBucketId =
        normalizeActionSource(actionBucketId) || normalizedActionSource;
    const bucketStart = new Date(
        Math.floor(new Date(clientActionAt).getTime() / bucketMs) * bucketMs,
    ).toISOString();
    const dedupeSeed = [
        examSessionId ?? 'unknown-session',
        eventType,
        normalizedActionBucketId,
        bucketStart,
    ].join(':');
    const eventId = toStableUuid(dedupeSeed);
    const dedupeKey = dedupeSeed;

    return {
        eventId,
        dedupeKey,
        clientActionAt,
        detectionTimestamp: clientActionAt,
        detectorSource: normalizedActionSource || 'generic-action',
        eventSubtype: normalizedActionSource || normalizedActionBucketId || 'generic-action',
    };
}
