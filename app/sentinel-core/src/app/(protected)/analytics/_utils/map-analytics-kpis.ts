import { AnalyticsKPIsSummary } from '@sentinel/services';
import { AnalyticsKPICardData } from '@sentinel/shared/types';

/**
 * Maps high-level raw telemetry KPI numbers from the API response
 * into the structured format required by the AnalyticsKPICards component.
 *
 * @param summary - The raw KPIs summary object from the API.
 * @returns An array of mapped KPI card data objects.
 */
export function mapAnalyticsKPIs(summary?: AnalyticsKPIsSummary): AnalyticsKPICardData[] {
    if (!summary) {
        return [];
    }

    return [
        {
            id: 'kpi-1',
            label: 'Total Exams',
            value: (summary.totalExams ?? 0).toLocaleString(),
            description: 'Configured exam blueprints',
        },
        {
            id: 'kpi-2',
            label: 'Monitored Sessions',
            value: (summary.totalAttempts ?? 0).toLocaleString(),
            description: 'Total exams proctored',
        },
        {
            id: 'kpi-3',
            label: 'Flagged Incidents',
            value: (summary.totalIncidents ?? 0).toLocaleString(),
            description: 'Requires manual review',
        },
        {
            id: 'kpi-4',
            label: 'Flagged Attempts',
            value: (summary.flaggedAttempts ?? 0).toLocaleString(),
            description: 'Attempts with flags',
        },
    ];
}
