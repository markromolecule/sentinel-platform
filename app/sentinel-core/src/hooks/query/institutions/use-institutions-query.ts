import { useQuery } from '@tanstack/react-query';
import { getInstitutions } from '@/data';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';

/**
 * Hook to fetch all institutions
 * Follows the pattern from useDepartmentsQuery
 */
export function useInstitutionsQuery(search?: string) {
    return useQuery({
        queryKey: [...INSTITUTION_QUERY_KEYS.all, search],
        queryFn: () => getInstitutions(search),
        placeholderData: (previousData) => previousData,
    });
}
