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
            includeInstitutionUsers: undefined,
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
            includeInstitutionUsers: undefined,
            enabled: false,
        });
        expect(result.users).toEqual([]);
    });

    it('returns avatarUrl in user objects when present in API response', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: [
                {
                    id: 'user-2',
                    firstName: 'Alice',
                    lastName: 'Smith',
                    role: 'student',
                    avatarUrl: 'https://example.com/avatar.png',
                },
            ],
            isLoading: false,
            isError: false,
        } as any);

        const result = useUserSearch('ali');

        expect(result.users).toHaveLength(1);
        expect(result.users[0].avatarUrl).toBe('https://example.com/avatar.png');
    });

    it('returns avatarUrl as null when not set in API response', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: [
                {
                    id: 'user-3',
                    firstName: 'Bob',
                    lastName: 'Jones',
                    role: 'instructor',
                    avatarUrl: null,
                },
            ],
            isLoading: false,
            isError: false,
        } as any);

        const result = useUserSearch('bo');

        expect(result.users[0].avatarUrl).toBeNull();
    });

    it('passes includeInstitutionUsers option when provided', () => {
        vi.mocked(useUsersQuery).mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any);

        useUserSearch('jo', { includeInstitutionUsers: true });

        expect(useUsersQuery).toHaveBeenCalledWith({
            search: 'jo',
            role: undefined,
            includeInstitutionUsers: true,
            enabled: true,
        });
    });
});
