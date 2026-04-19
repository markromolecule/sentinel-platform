export const CLASSROOM_QUERY_KEYS = {
    all: ['classrooms'] as const,
    details: (id: string) => ['classrooms', id] as const,
};
