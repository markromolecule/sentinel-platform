export const ANALYTICS_QUERY_KEYS = {
    all: ['analytics'] as const,
    kpis: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'kpis', institutionId ?? ''] as const,
    incidentSeverity: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'incidentSeverity', institutionId ?? ''] as const,
    incidentType: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'incidentType', institutionId ?? ''] as const,
    departmentIntegrity: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'departmentIntegrity', institutionId ?? ''] as const,
    reports: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'reports', institutionId ?? ''] as const,
    examCompletions: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'examCompletions', institutionId ?? ''] as const,
    incidentTrends: (institutionId?: string) =>
        [...ANALYTICS_QUERY_KEYS.all, 'incidentTrends', institutionId ?? ''] as const,
} as const;

export const ANALYTICS_MUTATION_KEYS = {
    generateReport: () => [...ANALYTICS_QUERY_KEYS.all, 'generateReport'] as const,
} as const;
