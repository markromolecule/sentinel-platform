import {
    AnalyticsReport,
    AnalyticsKPICardData,
    IncidentSeverityDistribution,
    IncidentTypeDistribution,
    DepartmentIntegrityMetric,
} from '../..';

export interface ChartProps {
    data: Record<string, unknown>[];
}

export interface AnalyticsReportsListProps {
    reports: AnalyticsReport[];
}

export interface AnalyticsKPICardsProps {
    data: AnalyticsKPICardData[];
}

export interface IncidentSeverityChartProps {
    data: IncidentSeverityDistribution[];
}

export interface IncidentByTypeChartProps {
    data: IncidentTypeDistribution[];
}

export interface DepartmentIntegrityChartProps {
    data: DepartmentIntegrityMetric[];
}
