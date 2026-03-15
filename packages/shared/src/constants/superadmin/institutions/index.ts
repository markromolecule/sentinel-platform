export const INSTITUTION_QUERY_KEYS = {
    all: ['/institutions'] as const,
    details: (id: string) => ['/institutions', id] as const,
};
