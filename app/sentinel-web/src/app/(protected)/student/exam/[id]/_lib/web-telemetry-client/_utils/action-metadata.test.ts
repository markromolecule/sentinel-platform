import { describe, expect, it } from 'vitest';
import { createTelemetryActionMetadata } from './action-metadata';

describe('createTelemetryActionMetadata', () => {
    it('builds deterministic eventId, dedupeKey, and clientActionAt metadata for one action bucket', () => {
        const metadata = createTelemetryActionMetadata({
            eventType: 'TAB_SWITCH',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'window-blur',
            actionBucketId: 'focus-visibility',
            clientActionAt: '2026-07-07T00:00:00.250Z',
            bucketMs: 1000,
        });

        expect(metadata.eventId).toBeDefined();
        expect(metadata.eventId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
        expect(metadata.dedupeKey).toBe(
            '123e4567-e89b-12d3-a456-426614174000:TAB_SWITCH:focus-visibility:2026-07-07T00:00:00.000Z',
        );
        expect(metadata.clientActionAt).toBe('2026-07-07T00:00:00.250Z');
        expect(metadata.detectionTimestamp).toBe('2026-07-07T00:00:00.250Z');
        expect(metadata.detectorSource).toBe('window-blur');
        expect(metadata.eventSubtype).toBe('window-blur');
    });

    it('keeps metadata stable for repeated calls in the same action bucket and changes after the bucket rolls', () => {
        const meta1 = createTelemetryActionMetadata({
            eventType: 'RIGHT_CLICK_ATTEMPT',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'contextmenu',
            actionBucketId: 'right-click',
            clientActionAt: '2026-07-07T00:00:00.100Z',
            bucketMs: 800,
        });
        const meta2 = createTelemetryActionMetadata({
            eventType: 'RIGHT_CLICK_ATTEMPT',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'contextmenu',
            actionBucketId: 'right-click',
            clientActionAt: '2026-07-07T00:00:00.700Z',
            bucketMs: 800,
        });
        const meta3 = createTelemetryActionMetadata({
            eventType: 'RIGHT_CLICK_ATTEMPT',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'contextmenu',
            actionBucketId: 'right-click',
            clientActionAt: '2026-07-07T00:00:01.700Z',
            bucketMs: 800,
        });

        expect(meta1.eventId).toBe(meta2.eventId);
        expect(meta1.dedupeKey).toBe(meta2.dedupeKey);
        expect(meta1.eventId).not.toBe(meta3.eventId);
        expect(meta1.dedupeKey).not.toBe(meta3.dedupeKey);
    });

    it('keeps one correlation identity across different browser signals in the same configured action bucket', () => {
        const blurMetadata = createTelemetryActionMetadata({
            eventType: 'TAB_SWITCH',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'window-blur',
            actionBucketId: 'focus-visibility',
            clientActionAt: '2026-07-07T00:00:00.100Z',
            bucketMs: 1000,
        });
        const visibilityMetadata = createTelemetryActionMetadata({
            eventType: 'TAB_SWITCH',
            examSessionId: '123e4567-e89b-12d3-a456-426614174000',
            actionSource: 'visibility-change',
            actionBucketId: 'focus-visibility',
            clientActionAt: '2026-07-07T00:00:00.600Z',
            bucketMs: 1000,
        });

        expect(blurMetadata.eventId).toBe(visibilityMetadata.eventId);
        expect(blurMetadata.dedupeKey).toBe(visibilityMetadata.dedupeKey);
        expect(blurMetadata.detectorSource).toBe('window-blur');
        expect(visibilityMetadata.detectorSource).toBe('visibility-change');
    });
});
