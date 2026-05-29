import { describe, it, expect } from 'vitest';
import { mapExamStats } from './map-exam-stats';

describe('mapExamStats', () => {
    it('returns zeroes for empty data', () => {
        const result = mapExamStats([]);
        expect(result.completionRate).toBe(0);
        expect(result.dropRate).toBe(0);
        expect(result.totalCompleted).toBe(0);
        expect(result.totalDropped).toBe(0);
        expect(result.totalSessions).toBe(0);
    });

    it('returns zeroes when all sessions are dropped', () => {
        const data = [
            { name: 'Mon', completed: 0, dropped: 50 },
            { name: 'Tue', completed: 0, dropped: 30 },
        ];
        const result = mapExamStats(data);
        expect(result.completionRate).toBe(0);
        expect(result.dropRate).toBe(100);
        expect(result.totalDropped).toBe(80);
    });

    it('computes correct rates for normal data', () => {
        const data = [
            { name: 'Mon', completed: 80, dropped: 20 },
            { name: 'Tue', completed: 70, dropped: 30 },
        ];
        const result = mapExamStats(data);
        // totalCompleted=150, totalDropped=50, total=200
        expect(result.totalCompleted).toBe(150);
        expect(result.totalDropped).toBe(50);
        expect(result.totalSessions).toBe(200);
        expect(result.completionRate).toBe(75);
        expect(result.dropRate).toBe(25);
    });

    it('handles a single day with 100% completion', () => {
        const data = [{ name: 'Mon', completed: 100, dropped: 0 }];
        const result = mapExamStats(data);
        expect(result.completionRate).toBe(100);
        expect(result.dropRate).toBe(0);
    });

    it('returns zeroes for undefined/null data gracefully', () => {
        // @ts-expect-error testing null guard
        const result = mapExamStats(null);
        expect(result.completionRate).toBe(0);
    });
});
