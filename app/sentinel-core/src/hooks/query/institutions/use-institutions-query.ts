import { useQuery } from '@tanstack/react-query';
import { getInstitutions } from '@/data';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useUser } from '@/hooks/use-user';

/**
 * Hook to fetch all institutions
 * Follows the pattern from useDepartmentsQuery
 */
export function useInstitutionsQuery(search?: string) {
    const { data: user, isLoading: isUserLoading } = useUser();
    const isSuperadmin = user?.role === 'superadmin';

    return useQuery({
        queryKey: [...INSTITUTION_QUERY_KEYS.all, search],
        queryFn: () => getInstitutions(search),
        enabled: !isUserLoading && isSuperadmin,
        placeholderData: (previousData) => previousData,
    });
}
