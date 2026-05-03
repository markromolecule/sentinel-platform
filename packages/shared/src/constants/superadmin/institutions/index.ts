export const INSTITUTION_QUERY_KEYS = {
    all: ['/institutions'] as const,
    details: (id: string) => ['/institutions', id] as const,
    namingConventions: (institutionId: string) =>
        [...INSTITUTION_QUERY_KEYS.details(institutionId), 'naming-conventions'] as const,
    effectiveNamingConventions: (institutionId: string) =>
        [...INSTITUTION_QUERY_KEYS.namingConventions(institutionId), 'effective'] as const,
};
