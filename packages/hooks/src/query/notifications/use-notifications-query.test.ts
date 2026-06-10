import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useNotificationsQuery } from './use-notifications-query';
import { getNotifications } from '@sentinel/services';

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        if (options.queryFn) {
            options.queryFn();
        }

        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
        };
    }),
}));

vi.mock('@sentinel/services', () => ({
    getNotifications: vi.fn(),
}));

vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useNotificationsQuery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uses the provided query key and params', () => {
        const queryKey = ['notifications', 'core-header'];
        const params = { limit: 5, status: 'UNREAD' as const };

        const query = useNotificationsQuery({ queryKey, params }) as any;

        expect(query.queryKey).toEqual(queryKey);
        expect(getNotifications).toHaveBeenCalledWith({ mockClient: true }, params);
        expect(query.enabled).toBe(true);
    });

    it('respects the enabled flag', () => {
        const query = useNotificationsQuery({
            queryKey: ['notifications', 'support-header'],
            enabled: false,
        }) as any;

        expect(query.enabled).toBe(false);
    });
});
