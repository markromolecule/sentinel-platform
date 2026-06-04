import { useDebounce } from '../../use-debounce';
import { useUsersQuery } from './use-users-query';

/**
 * Debounced user search hook.
 * Wraps useUsersQuery with a 300ms debounce applied to the search string.
 *
 * @param query - The raw search string typed by the user.
 * @param options - Optional role filter.
 */
export function useUserSearch(query: string, options?: { role?: string[] }) {
    const debouncedQuery = useDebounce(query, 300);

    const usersQuery = useUsersQuery({
        search: debouncedQuery,
        role: options?.role,
        enabled: debouncedQuery.length >= 2,
    });

    return {
        users: usersQuery.data || [],
        isLoading: usersQuery.isLoading,
        isError: usersQuery.isError,
        error: usersQuery.error,
    };
}
