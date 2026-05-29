import { AnalyticsKPIsSummary } from '@sentinel/services';
import { AnalyticsKPICardData } from '@sentinel/shared/types';

/**
 * Derives a simple trend direction from a computed delta.
 *
 * @param delta - Positive = up, negative = down, zero = neutral.
 * @returns Trend direction string.
 */
function toTrend(delta: number): 'up' | 'down' | 'neutral' {
    if (delta > 0) return 'up';
    if (delta < 0) return 'down';
    return 'neutral';
}

/**
 * Maps high-level raw telemetry KPI numbers from the API response
 * into the structured format required by the AnalyticsKPICards component.
 * Derives change percentages and trend directions from the live summary fields.
 *
 * @param summary - The raw KPIs summary object from the API.
 * @returns An array of mapped KPI card data objects.
 */
export function mapAnalyticsKPIs(summary?: AnalyticsKPIsSummary): AnalyticsKPICardData[] {
    if (!summary) {
        return [];
    }

    // Completion rate as a proxy trend: completed / total attempts
    const completionRate =
        summary.totalAttempts > 0
            ? Math.round((summary.completedAttempts / summary.totalAttempts) * 100)
            : 0;

    // Flagged rate: flagged attempts as % of total
    const flaggedRate =
        summary.totalAttempts > 0
            ? Math.round((summary.flaggedAttempts / summary.totalAttempts) * 100)
            : 0;

    return [
        {
            id: 'kpi-1',
            label: 'Total Exams',
            value: (summary.totalExams ?? 0).toLocaleString(),
            change: summary.activeExams,
            trend: summary.activeExams > 0 ? 'up' : 'neutral',
            description: `${summary.activeExams ?? 0} currently active`,
        },
        {
            id: 'kpi-2',
            label: 'Monitored Sessions',
            value: (summary.totalAttempts ?? 0).toLocaleString(),
            change: completionRate,
            trend: toTrend(completionRate - 80), // baseline threshold: 80% completion
            description: `${completionRate}% completion rate`,
        },
        {
            id: 'kpi-3',
            label: 'Flagged Incidents',
            value: (summary.totalIncidents ?? 0).toLocaleString(),
            change: flaggedRate,
            trend: toTrend(-(flaggedRate)), // high flagged rate = bad = down
            description: `${flaggedRate}% of sessions flagged`,
        },
        {
            id: 'kpi-4',
            label: 'Flagged Attempts',
            value: (summary.flaggedAttempts ?? 0).toLocaleString(),
            change: summary.flaggedAttempts,
            trend: summary.flaggedAttempts > 0 ? 'down' : 'neutral',
            description: 'Attempts requiring review',
        },
        {
            id: 'kpi-5',
            label: 'Integrity Index',
            value: `${(summary.integrityIndex ?? 0).toFixed(1)}`,
            change: summary.integrityIndex,
            trend: toTrend((summary.integrityIndex ?? 0) - 85), // baseline threshold: 85
            description: 'System-wide trust score',
        },
    ];
}
