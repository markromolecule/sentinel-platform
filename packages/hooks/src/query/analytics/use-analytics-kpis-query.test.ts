import { describe, expect, it, vi } from 'vitest';
import { useAnalyticsKPIsQuery } from './use-analytics-kpis-query';
import { getAnalyticsKPIs } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';

// Mock tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn((options: any) => {
        // execute queryFn to test the data flow
        if (options.queryFn) {
            options.queryFn();
        }
        return {
            queryKey: options.queryKey,
            enabled: options.enabled,
        };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    getAnalyticsKPIs: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

// Mock authentication status hook
vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: vi.fn(() => true),
}));

describe('useAnalyticsKPIsQuery Hook', () => {
    it('sets the correct query key and calls the client function', () => {
        const payload = { institution_id: 'inst-789' };

        const query = useAnalyticsKPIsQuery({ payload }) as any;

        expect(query.queryKey).toEqual(ANALYTICS_QUERY_KEYS.kpis('inst-789'));
        expect(getAnalyticsKPIs).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(query.enabled).toBe(true);
    });

    it('defaults institutionId to empty string when not provided in payload', () => {
        const query = useAnalyticsKPIsQuery() as any;

        expect(query.queryKey).toEqual(ANALYTICS_QUERY_KEYS.kpis(''));
        expect(getAnalyticsKPIs).toHaveBeenCalledWith({ mockClient: true }, undefined);
    });
});
