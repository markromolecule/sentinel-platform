import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useUserSearch } from './use-user-search';
import { useUsersQuery } from './use-users-query';
import { useDebounce } from '../../use-debounce';

vi.mock('../../use-debounce', () => ({
    useDebounce: vi.fn((val) => val),
}));

vi.mock('./use-users-query', () => ({
    useUsersQuery: vi.fn(),
}));

describe('useUserSearch Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debounces and enables query when search query >= 2 characters', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: [{ id: 'user-1', name: 'John Doe' }],
            isLoading: false,
            isError: false,
        } as any);

        const result = useUserSearch('jo');

        expect(useDebounce).toHaveBeenCalledWith('jo', 300);
        expect(useUsersQuery).toHaveBeenCalledWith({
            search: 'jo',
            role: undefined,
            enabled: true,
        });
        expect(result.users).toEqual([{ id: 'user-1', name: 'John Doe' }]);
    });

    it('disables query when search query is less than 2 characters', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: null,
            isLoading: false,
            isError: false,
        } as any);

        const result = useUserSearch('j');

        expect(useDebounce).toHaveBeenCalledWith('j', 300);
        expect(useUsersQuery).toHaveBeenCalledWith({
            search: 'j',
            role: undefined,
            enabled: false,
        });
        expect(result.users).toEqual([]);
    });
});
