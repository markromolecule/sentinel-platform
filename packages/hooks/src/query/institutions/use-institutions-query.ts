import { useQuery } from '@tanstack/react-query';
import { getInstitutions } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useInstitutionsQuery(search?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: INSTITUTION_QUERY_KEYS.all,
        queryFn: () => getInstitutions(apiClient, search),
        enabled: isAuthenticatedQueryEnabled,
    });
}
