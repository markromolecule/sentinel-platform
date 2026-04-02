export const STUDENT_WHITELIST_QUERY_KEYS = {
    all: ['student-whitelist'] as const,
    details: (id: string) => ['student-whitelist', id] as const,
};
