import { AnalyticsReport } from '..';

export interface ChartProps {
    data: Record<string, unknown>[];
}

export interface AnalyticsReportsListProps {
    reports: AnalyticsReport[];
}
