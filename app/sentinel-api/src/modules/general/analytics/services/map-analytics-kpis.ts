import { type RawKPIAggregates } from '../data/get-analytics-kpis';

export type AnalyticsKPIsSummary = RawKPIAggregates & {
    integrityIndex: number;
};

/**
 * Pure helper function that receives raw KPI row aggregates and computes the integrityIndex percentage.
 *
 * @param aggregates - Raw KPI aggregates from data layer.
 * @returns Mapped KPI summary with calculated integrityIndex.
 */
export function mapAnalyticsKPIs(aggregates: RawKPIAggregates): AnalyticsKPIsSummary {
    const { completedAttempts, flaggedAttempts } = aggregates;

    let integrityIndex = 100;
    if (completedAttempts > 0) {
        integrityIndex = ((completedAttempts - flaggedAttempts) / completedAttempts) * 100;
        // Clamp between 0 and 100
        integrityIndex = Math.max(0, Math.min(100, integrityIndex));
    }

    return {
        ...aggregates,
        integrityIndex: Math.round(integrityIndex * 100) / 100,
    };
}
