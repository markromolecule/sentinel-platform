// Constants for Course Query Keys
export const COURSE_QUERY_KEYS = {
    all: ['courses'] as const,
    detail: (id: string) => [...COURSE_QUERY_KEYS.all, id] as const,
    lists: () => [...COURSE_QUERY_KEYS.all, 'list'] as const,
    list: (filters: Record<string, string>) => [...COURSE_QUERY_KEYS.lists(), { filters }] as const,
} as const;
