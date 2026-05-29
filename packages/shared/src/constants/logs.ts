export const LOGS_QUERY_KEYS = {
    all: ['logs'] as const,
    auth: (params?: any) => [...LOGS_QUERY_KEYS.all, 'auth', params] as const,
    activity: (params?: any) => [...LOGS_QUERY_KEYS.all, 'activity', params] as const,
    system: (params?: any) => [...LOGS_QUERY_KEYS.all, 'system', params] as const,
} as const;
