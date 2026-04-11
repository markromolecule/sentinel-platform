export const ROOM_QUERY_KEYS = {
    all: ['rooms'] as const,
    details: (id: string) => ['rooms', id] as const,
};
