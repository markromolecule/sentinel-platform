import { describe, expect, it } from 'vitest';
import { parseDateValue } from './date-utils';

describe('parseDateValue', () => {
    it('returns null for falsy values', () => {
        expect(parseDateValue(undefined)).toBeNull();
        expect(parseDateValue(null)).toBeNull();
        expect(parseDateValue('')).toBeNull();
    });

    it('returns a valid Date object when given a Date object', () => {
        const date = new Date('2026-01-01T00:00:00Z');
        expect(parseDateValue(date)).toEqual(date);
    });

    it('returns a parsed Date when given a valid date string', () => {
        const parsed = parseDateValue('2026-01-01T00:00:00Z');
        expect(parsed).toBeInstanceOf(Date);
        expect(parsed?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    });

    it('returns null for an invalid date string', () => {
        expect(parseDateValue('invalid-date')).toBeNull();
    });
});
