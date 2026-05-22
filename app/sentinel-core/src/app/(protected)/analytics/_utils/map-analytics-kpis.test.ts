import { describe, expect, it } from 'vitest';
import { mapAnalyticsKPIs } from './map-analytics-kpis';
import { AnalyticsKPIsSummary } from '@sentinel/services';

describe('mapAnalyticsKPIs', () => {
    it('should map raw KPI telemetry summary to structured card data', () => {
        const mockSummary: AnalyticsKPIsSummary = {
            totalExams: 10,
            totalAttempts: 1842,
            completedAttempts: 1735,
            totalIncidents: 107,
            flaggedAttempts: 84,
            activeExams: 3,
            integrityIndex: 94.234,
        };

        const result = mapAnalyticsKPIs(mockSummary);

        expect(result).toHaveLength(4);

        // KPI 1: Total Exams
        expect(result[0]).toEqual({
            id: 'kpi-1',
            label: 'Total Exams',
            value: '10',
            description: 'Configured exam blueprints',
        });

        // KPI 2: Monitored Sessions
        expect(result[1]).toEqual({
            id: 'kpi-2',
            label: 'Monitored Sessions',
            value: '1,842',
            description: 'Total exams proctored',
        });

        // KPI 3: Flagged Incidents
        expect(result[2]).toEqual({
            id: 'kpi-3',
            label: 'Flagged Incidents',
            value: '107',
            description: 'Requires manual review',
        });

        // KPI 4: Flagged Attempts
        expect(result[3]).toEqual({
            id: 'kpi-4',
            label: 'Flagged Attempts',
            value: '84',
            description: 'Attempts with flags',
        });
    });

    it('should handle undefined summary gracefully', () => {
        const result = mapAnalyticsKPIs(undefined);
        expect(result).toEqual([]);
    });

    it('should handle missing fields gracefully by defaulting to 0 or 0.0%', () => {
        const mockPartialSummary = {} as AnalyticsKPIsSummary;
        const result = mapAnalyticsKPIs(mockPartialSummary);

        expect(result).toHaveLength(4);
        expect(result[0].value).toBe('0');
        expect(result[1].value).toBe('0');
        expect(result[2].value).toBe('0');
        expect(result[3].value).toBe('0');
    });
});
