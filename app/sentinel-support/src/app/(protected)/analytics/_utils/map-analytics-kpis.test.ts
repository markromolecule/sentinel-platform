import { describe, expect, it } from 'vitest';
import { mapAnalyticsKPIs } from './map-analytics-kpis';
import { AnalyticsKPIsSummary } from '@sentinel/services';

const mockSummary: AnalyticsKPIsSummary = {
    totalExams: 10,
    totalAttempts: 1842,
    completedAttempts: 1735,
    totalIncidents: 107,
    flaggedAttempts: 84,
    activeExams: 3,
    integrityIndex: 94.234,
};

describe('mapAnalyticsKPIs', () => {
    it('should return 5 KPI cards including Integrity Index', () => {
        const result = mapAnalyticsKPIs(mockSummary);
        expect(result).toHaveLength(5);
    });

    it('should map KPI-1 (Total Exams) with live trend from activeExams', () => {
        const result = mapAnalyticsKPIs(mockSummary);
        expect(result[0].id).toBe('kpi-1');
        expect(result[0].label).toBe('Total Exams');
        expect(result[0].value).toBe('10');
        expect(result[0].trend).toBe('up'); // activeExams=3 > 0
        expect(result[0].description).toBe('3 currently active');
    });

    it('should map KPI-2 (Monitored Sessions) with computed completion rate', () => {
        const result = mapAnalyticsKPIs(mockSummary);
        // completionRate = round(1735/1842 * 100) = 94%
        expect(result[1].id).toBe('kpi-2');
        expect(result[1].change).toBe(94);
        expect(result[1].trend).toBe('up'); // 94 > 80 threshold
        expect(result[1].description).toBe('94% completion rate');
    });

    it('should map KPI-3 (Flagged Incidents) with flagged rate as a down trend', () => {
        const result = mapAnalyticsKPIs(mockSummary);
        // flaggedRate = round(84/1842 * 100) = 5%
        expect(result[2].id).toBe('kpi-3');
        expect(result[2].trend).toBe('down'); // high flagged = bad
    });

    it('should map KPI-5 (Integrity Index) from integrityIndex field', () => {
        const result = mapAnalyticsKPIs(mockSummary);
        expect(result[4].id).toBe('kpi-5');
        expect(result[4].label).toBe('Integrity Index');
        expect(result[4].value).toBe('94.2');
        expect(result[4].trend).toBe('up'); // 94.234 > 85 threshold
        expect(result[4].description).toBe('System-wide trust score');
    });

    it('should handle undefined summary gracefully', () => {
        const result = mapAnalyticsKPIs(undefined);
        expect(result).toEqual([]);
    });

    it('should handle missing fields gracefully by defaulting to 0', () => {
        const result = mapAnalyticsKPIs({} as AnalyticsKPIsSummary);
        expect(result).toHaveLength(5);
        expect(result[0].value).toBe('0');
        expect(result[1].value).toBe('0');
        expect(result[4].value).toBe('0.0');
    });

    it('should return neutral trend for zero activeExams', () => {
        const result = mapAnalyticsKPIs({ ...mockSummary, activeExams: 0 });
        expect(result[0].trend).toBe('neutral');
    });

    it('should return neutral trend for zero integrityIndex', () => {
        const result = mapAnalyticsKPIs({ ...mockSummary, integrityIndex: 85 });
        // 85 - 85 = 0 → neutral
        expect(result[4].trend).toBe('neutral');
    });
});
