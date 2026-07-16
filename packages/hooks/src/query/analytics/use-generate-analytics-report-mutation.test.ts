import { describe, expect, it, vi } from 'vitest';
import { useGenerateAnalyticsReportMutation } from './use-generate-analytics-report-mutation';
import { generateAnalyticsReport } from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';

const mockInvalidateQueries = vi.fn();

// Mock tanstack/react-query
vi.mock('@tanstack/react-query', () => ({
    useQueryClient: vi.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
    useMutation: vi.fn((options: any) => {
        // Simple mock mutation execution to trigger onSuccess
        const mutateAsync = async (variables: any) => {
            if (options.mutationFn) {
                await options.mutationFn(variables);
            }
            if (options.onSuccess) {
                await options.onSuccess({ reportId: 'new-rep-123' }, variables, null);
            }
        };
        return { mutateAsync };
    }),
}));

// Mock sentinel/services
vi.mock('@sentinel/services', () => ({
    generateAnalyticsReport: vi.fn(),
}));

// Mock api provider hook
vi.mock('../../api-provider', () => ({
    useApi: vi.fn(() => ({ mockClient: true })),
}));

describe('useGenerateAnalyticsReportMutation Hook', () => {
    it('calls generateAnalyticsReport and invalidates cache on success', async () => {
        const payload = {
            title: 'Monthly Safety Report',
            institutionId: 'institution-1',
            period: 'LAST_30_DAYS' as const,
            timezone: 'Asia/Manila' as const,
        };

        const mutation = useGenerateAnalyticsReportMutation();
        await (mutation as any).mutateAsync(payload);

        expect(generateAnalyticsReport).toHaveBeenCalledWith({ mockClient: true }, payload);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: [...ANALYTICS_QUERY_KEYS.all, 'reports'],
        });
    });
});
