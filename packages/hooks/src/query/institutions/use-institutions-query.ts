import { useQuery } from '@tanstack/react-query';
import { getInstitutions } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useInstitutionsQuery(params: { search?: string } = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...INSTITUTION_QUERY_KEYS.all, { search: params.search }],
        queryFn: () => getInstitutions(apiClient, { search: params.search }),
        enabled: isAuthenticatedQueryEnabled,
    });
}
