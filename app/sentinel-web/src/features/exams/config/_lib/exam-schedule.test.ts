import { describe, expect, it } from 'vitest';
import {
    getDurationMinutes,
    getEndDateTimeFromDuration,
    serializeDateTimeForApi,
    toDateTimeLocal,
} from './exam-schedule';

describe('exam schedule helpers', () => {
    it('preserves the selected wall-clock time when serializing for the api', () => {
        const selectedStartTime = '2026-04-23T03:50';

        expect(toDateTimeLocal(serializeDateTimeForApi(selectedStartTime))).toBe(selectedStartTime);
    });

    it('keeps duration calculations stable after api serialization', () => {
        const selectedStartTime = '2026-04-23T03:50';
        const selectedEndTime = getEndDateTimeFromDuration(selectedStartTime, 30);

        expect(
            getDurationMinutes(
                toDateTimeLocal(serializeDateTimeForApi(selectedStartTime)),
                toDateTimeLocal(serializeDateTimeForApi(selectedEndTime)),
            ),
        ).toBe(30);
    });
});
