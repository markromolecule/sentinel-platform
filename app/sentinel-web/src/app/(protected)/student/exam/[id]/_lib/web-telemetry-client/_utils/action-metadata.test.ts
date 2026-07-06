import { describe, expect, it } from 'vitest';
import { createTelemetryActionMetadata } from './action-metadata';

describe('createTelemetryActionMetadata', () => {
    it('generates unique eventId, dedupeKey, and clientActionAt timestamp', () => {
        const metadata = createTelemetryActionMetadata('TAB_SWITCH');

        expect(metadata.eventId).toBeDefined();
        // Check if eventId is a valid UUID v4 shape
        expect(metadata.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

        expect(metadata.dedupeKey).toBe(`TAB_SWITCH:${metadata.eventId}`);
        expect(metadata.clientActionAt).toBeDefined();
        expect(new Date(metadata.clientActionAt).getTime()).not.toBeNaN();
    });

    it('generates different eventIds for multiple calls', () => {
        const meta1 = createTelemetryActionMetadata('TAB_SWITCH');
        const meta2 = createTelemetryActionMetadata('TAB_SWITCH');

        expect(meta1.eventId).not.toBe(meta2.eventId);
        expect(meta1.dedupeKey).not.toBe(meta2.dedupeKey);
    });
});
