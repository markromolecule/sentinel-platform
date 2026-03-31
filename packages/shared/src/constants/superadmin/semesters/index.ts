export const SEMESTER_QUERY_KEYS = {
    all: ['semesters'] as const,
    list: () => [...SEMESTER_QUERY_KEYS.all, 'list'] as const,
    details: () => [...SEMESTER_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...SEMESTER_QUERY_KEYS.details(), id] as const,
};
