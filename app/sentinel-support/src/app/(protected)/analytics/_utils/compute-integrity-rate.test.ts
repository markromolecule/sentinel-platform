import { describe, it, expect } from 'vitest';
import { computeIntegrityRate, getIntegrityTier } from './compute-integrity-rate';

describe('computeIntegrityRate', () => {
    it('returns 0 when completed is 0', () => {
        expect(computeIntegrityRate(0, 0)).toBe(0);
    });

    it('returns 0 when completed is negative', () => {
        expect(computeIntegrityRate(-5, 0)).toBe(0);
    });

    it('returns 100 when there are no flagged sessions', () => {
        expect(computeIntegrityRate(100, 0)).toBe(100);
    });

    it('returns 0 when all sessions are flagged', () => {
        expect(computeIntegrityRate(100, 100)).toBe(0);
    });

    it('computes the correct rate for a normal case', () => {
        // (100 - 10) / 100 * 100 = 90%
        expect(computeIntegrityRate(100, 10)).toBe(90);
    });

    it('clamps to 100 when flagged is negative (data anomaly)', () => {
        expect(computeIntegrityRate(100, -10)).toBe(100);
    });

    it('returns a whole number (rounded)', () => {
        // (3 - 1) / 3 * 100 = 66.67 → 67
        expect(computeIntegrityRate(3, 1)).toBe(67);
    });
});

describe('getIntegrityTier', () => {
    it('returns "high" for rates >= 95', () => {
        expect(getIntegrityTier(95)).toBe('high');
        expect(getIntegrityTier(100)).toBe('high');
    });

    it('returns "medium" for rates 85–94', () => {
        expect(getIntegrityTier(85)).toBe('medium');
        expect(getIntegrityTier(94)).toBe('medium');
    });

    it('returns "low" for rates below 85', () => {
        expect(getIntegrityTier(84)).toBe('low');
        expect(getIntegrityTier(0)).toBe('low');
    });
});
