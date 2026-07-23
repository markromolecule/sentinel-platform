import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMonitoringEventTraceBuffer, writeMonitoringEventTrace } from './monitoring-event-trace';

describe('monitoring-event-trace', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        delete globalThis.__SENTINEL_MONITORING_EVENT_TRACES__;
    });

    it('is a production no-op', () => {
        vi.stubEnv('NODE_ENV', 'production');

        expect(getMonitoringEventTraceBuffer()).toBeNull();
        expect(
            writeMonitoringEventTrace({
                detectorSource: 'contextmenu',
                eventType: 'RIGHT_CLICK_ATTEMPT',
                eventSubtype: 'contextmenu',
                eventId: '123e4567-e89b-12d3-a456-426614174000',
                dedupeKey: 'exam:RIGHT_CLICK_ATTEMPT:contextmenu:2026-07-11T00:00:00.000Z',
                detectionTime: '2026-07-11T00:00:00.250Z',
                emissionTime: '2026-07-11T00:00:00.300Z',
                disposition: 'suppressed',
                reason: 'rule-disabled',
            }),
        ).toBeNull();
        expect(globalThis.__SENTINEL_MONITORING_EVENT_TRACES__).toBeUndefined();
    });

    it('appends stable structured traces in development', () => {
        vi.stubEnv('NODE_ENV', 'development');

        const first = writeMonitoringEventTrace({
            detectorSource: 'contextmenu',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            eventSubtype: 'contextmenu',
            eventId: '123e4567-e89b-12d3-a456-426614174000',
            dedupeKey: 'exam:RIGHT_CLICK_ATTEMPT:contextmenu:2026-07-11T00:00:00.000Z',
            detectionTime: '2026-07-11T00:00:00.250Z',
            emissionTime: '2026-07-11T00:00:00.300Z',
            disposition: 'emitting',
        });
        const second = writeMonitoringEventTrace({
            detectorSource: 'contextmenu',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            eventSubtype: 'contextmenu',
            eventId: '123e4567-e89b-12d3-a456-426614174000',
            dedupeKey: 'exam:RIGHT_CLICK_ATTEMPT:contextmenu:2026-07-11T00:00:00.000Z',
            detectionTime: '2026-07-11T00:00:00.250Z',
            emissionTime: '2026-07-11T00:00:00.350Z',
            disposition: 'accepted',
        });

        expect(first).toEqual({
            detectorSource: 'contextmenu',
            eventType: 'RIGHT_CLICK_ATTEMPT',
            eventSubtype: 'contextmenu',
            eventId: '123e4567-e89b-12d3-a456-426614174000',
            dedupeKey: 'exam:RIGHT_CLICK_ATTEMPT:contextmenu:2026-07-11T00:00:00.000Z',
            detectionTime: '2026-07-11T00:00:00.250Z',
            emissionTime: '2026-07-11T00:00:00.300Z',
            disposition: 'emitting',
        });
        expect(getMonitoringEventTraceBuffer()).toEqual([first, second]);
    });
});
