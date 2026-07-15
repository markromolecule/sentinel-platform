export interface AnalyticsKPIs {
    averageScore: number; // e.g. 74.5
    passRate: number; // e.g. 82.3 (percent)
    totalCompletions: number;
    integrityIncidentsCount: number;
}

export interface DepartmentPerformance {
    departmentName: string;
    courseCount: number;
    studentCount: number;
    averageScore: number;
    integrityRate: number; // e.g. 98.5 (percent of exams with no incidents)
}

export interface IncidentTypeMetric {
    type: string; // e.g. "Tab Switching", "Multiple Faces"
    count: number;
    percentage: number;
}

export interface IncidentSeverityMetric {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    count: number;
}

export interface AnalyticsOverallData {
    generatedAt: string;
    generatedBy: string;
    institutionName: string;
    periodLabel: string; // e.g. "Last 30 Days (2026-06-15 to 2026-07-15)"
    kpis: AnalyticsKPIs;
    departments: DepartmentPerformance[];
    incidentTypes: IncidentTypeMetric[];
    incidentSeverities: IncidentSeverityMetric[];
}

/**
 * Normalizes analytics raw data, formatting empty values, rounding percentages/scores,
 * and ensuring stable defaults for missing fields.
 * 
 * @param data input partial data
 * @returns validated, normalized view model
 */
export function normalizeAnalyticsOverallData(data: Partial<AnalyticsOverallData>): AnalyticsOverallData {
    const kpis: AnalyticsKPIs = {
        averageScore: Number(data.kpis?.averageScore?.toFixed(1)) || 0,
        passRate: Number(data.kpis?.passRate?.toFixed(1)) || 0,
        totalCompletions: data.kpis?.totalCompletions || 0,
        integrityIncidentsCount: data.kpis?.integrityIncidentsCount || 0
    };

    const departments: DepartmentPerformance[] = (data.departments || []).map(dept => ({
        departmentName: dept.departmentName || 'Unknown Department',
        courseCount: dept.courseCount || 0,
        studentCount: dept.studentCount || 0,
        averageScore: Number(dept.averageScore?.toFixed(1)) || 0,
        integrityRate: Number(dept.integrityRate?.toFixed(1)) || 100.0
    }));

    const incidentTypes: IncidentTypeMetric[] = (data.incidentTypes || []).map(t => ({
        type: t.type || 'Other',
        count: t.count || 0,
        percentage: Number(t.percentage?.toFixed(1)) || 0
    }));

    const severityMap = new Map<string, number>();
    (data.incidentSeverities || []).forEach(s => {
        severityMap.set(s.severity.toUpperCase(), s.count);
    });

    const incidentSeverities: IncidentSeverityMetric[] = [
        { severity: 'LOW', count: severityMap.get('LOW') || 0 },
        { severity: 'MEDIUM', count: severityMap.get('MEDIUM') || 0 },
        { severity: 'HIGH', count: severityMap.get('HIGH') || 0 }
    ];

    return {
        generatedAt: data.generatedAt || new Date().toISOString(),
        generatedBy: data.generatedBy || 'System',
        institutionName: data.institutionName || 'Sentinel Institution',
        periodLabel: data.periodLabel || 'Custom Period',
        kpis,
        departments,
        incidentTypes,
        incidentSeverities
    };
}
