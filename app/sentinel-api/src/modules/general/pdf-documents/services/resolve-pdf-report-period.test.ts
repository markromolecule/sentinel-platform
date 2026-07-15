import { describe, expect, it } from 'vitest';
import { resolvePdfReportPeriod } from './resolve-pdf-report-period';

describe('resolvePdfReportPeriod', () => {
    it('should resolve LAST_7_DAYS correctly relative to today in Manila', () => {
        const result = resolvePdfReportPeriod({
            preset: 'LAST_7_DAYS',
        });

        expect(result.timezone).toBe('Asia/Manila');
        expect(result.startDateStr).toBeDefined();
        expect(result.endDateStr).toBeDefined();

        const startLocal = new Date(`${result.startDateStr}T00:00:00+08:00`);
        const endLocal = new Date(`${result.endDateStr}T00:00:00+08:00`);

        // Check if start is exactly 6 days before end
        const diffDays = Math.round((endLocal.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(6);

        // Check UTC coordinates
        expect(result.startAt.getTime()).toBe(startLocal.getTime());
        // endAtExclusive should be endLocal + 1 day
        const expectedEndExclusive = new Date(endLocal);
        expectedEndExclusive.setDate(endLocal.getDate() + 1);
        expect(result.endAtExclusive.getTime()).toBe(expectedEndExclusive.getTime());
    });

    it('should resolve LAST_30_DAYS correctly relative to today in Manila', () => {
        const result = resolvePdfReportPeriod({
            preset: 'LAST_30_DAYS',
        });

        const startLocal = new Date(`${result.startDateStr}T00:00:00+08:00`);
        const endLocal = new Date(`${result.endDateStr}T00:00:00+08:00`);

        const diffDays = Math.round((endLocal.getTime() - startLocal.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBe(29);
    });

    it('should resolve CUSTOM valid range correctly', () => {
        const result = resolvePdfReportPeriod({
            preset: 'CUSTOM',
            start_date: '2026-01-01',
            end_date: '2026-01-10',
        });

        expect(result.startDateStr).toBe('2026-01-01');
        expect(result.endDateStr).toBe('2026-01-10');

        // startAt should be 2026-01-01T00:00:00+08:00 -> 2025-12-31T16:00:00Z
        expect(result.startAt.toISOString()).toBe('2025-12-31T16:00:00.000Z');

        // endAtExclusive should be 2026-01-11T00:00:00+08:00 -> 2026-01-10T16:00:00Z
        expect(result.endAtExclusive.toISOString()).toBe('2026-01-10T16:00:00.000Z');
    });

    it('should throw error for invalid custom format', () => {
        expect(() => {
            resolvePdfReportPeriod({
                preset: 'CUSTOM',
                start_date: '2026/01/01',
                end_date: '2026-01-10',
            });
        }).toThrow('Dates must be in YYYY-MM-DD format');
    });

    it('should throw error for reversed custom dates', () => {
        expect(() => {
            resolvePdfReportPeriod({
                preset: 'CUSTOM',
                start_date: '2026-01-10',
                end_date: '2026-01-01',
            });
        }).toThrow('End date must be greater than or equal to start date');
    });

    it('should throw error for custom range exceeding 366 days', () => {
        expect(() => {
            resolvePdfReportPeriod({
                preset: 'CUSTOM',
                start_date: '2025-01-01',
                end_date: '2026-02-01',
            });
        }).toThrow('Date range cannot exceed 366 days');
    });
});
