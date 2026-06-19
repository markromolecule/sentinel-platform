import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useExamsQuery } from './use-exams-query';

const mockUseQuery = vi.fn();
const mockUseApi = vi.fn();
const mockUseAuth = vi.fn();
const mockUseAuthenticatedQueryEnabled = vi.fn();

vi.mock('@tanstack/react-query', () => ({
    useQuery: (...args: any[]) => mockUseQuery(...args),
}));

vi.mock('../../api-provider', () => ({
    useApi: () => mockUseApi(),
}));

vi.mock('../../auth-provider', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('../_shared/use-authenticated-query-enabled', () => ({
    useAuthenticatedQueryEnabled: () => mockUseAuthenticatedQueryEnabled(),
}));

describe('useExamsQuery', () => {
    beforeEach(() => {
        mockUseQuery.mockReset();
        mockUseApi.mockReset();
        mockUseAuth.mockReset();
        mockUseAuthenticatedQueryEnabled.mockReset();

        mockUseApi.mockReturnValue('api-client');
        mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
        mockUseAuthenticatedQueryEnabled.mockReturnValue(true);
    });

    it('scopes the query cache to the active user', () => {
        useExamsQuery({ status: 'draft' });

        expect(mockUseQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ['exams', 'user-1', { status: 'draft' }],
            }),
        );
    });
});
