export const USER_QUERY_KEYS = {
    all: ['users'] as const,
    details: (id: string) => ['users', id] as const,
};
