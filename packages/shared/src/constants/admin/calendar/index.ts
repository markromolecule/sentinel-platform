export { MOCK_ADMIN_EVENTS } from '../../../mock-data';

export const CALENDAR_QUERY_KEYS = {
    all: ['/calendar'] as const,
    search: (payload: any) => ['/calendar', 'search', payload] as const,
};
