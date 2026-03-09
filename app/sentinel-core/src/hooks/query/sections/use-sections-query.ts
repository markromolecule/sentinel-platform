import { useQuery } from '@tanstack/react-query';
import { getSections } from '@/data';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';

// Hook to fetch all sections
export function useSectionsQuery() {
    return useQuery({
        queryKey: SECTION_QUERY_KEYS.all,
        queryFn: () => getSections(),
    });
}
