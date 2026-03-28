import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/data';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';

/**
 * Hook to fetch a single user's detailed profile by ID
 */
export function useUserQuery(userId?: string) {
    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, 'detail', userId],
        queryFn: () => (userId ? getUser(userId) : Promise.reject('No user ID provided')),
        enabled: !!userId,
    });
}
