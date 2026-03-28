import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/data';
import { USER_QUERY_KEYS } from '@sentinel/shared/constants';

// Hook to fetch all users
export function useUsersQuery(search?: string) {
    return useQuery({
        queryKey: [...USER_QUERY_KEYS.all, search],
        queryFn: () => getUsers(search),
        placeholderData: (previousData) => previousData,
    });
}
