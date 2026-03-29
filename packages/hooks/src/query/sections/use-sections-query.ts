import { useQuery } from '@tanstack/react-query';
import { getSections } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';

export function useSectionsQuery(search?: string) {
    const apiClient = useApi();
    return useQuery({
        queryKey: [...SECTION_QUERY_KEYS.all, search],
        queryFn: () => getSections(apiClient, search),
    });
}
