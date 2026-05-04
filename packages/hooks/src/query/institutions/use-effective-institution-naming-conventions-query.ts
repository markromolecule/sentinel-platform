import { useQuery } from '@tanstack/react-query';
import { getEffectiveInstitutionNamingConventions } from '@sentinel/services';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useEffectiveInstitutionNamingConventionsQuery(institutionId?: string | null) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: institutionId
            ? INSTITUTION_QUERY_KEYS.effectiveNamingConventions(institutionId)
            : [...INSTITUTION_QUERY_KEYS.all, 'naming-conventions', 'effective', 'missing-id'],
        queryFn: () => getEffectiveInstitutionNamingConventions(apiClient, institutionId ?? ''),
        enabled: isAuthenticatedQueryEnabled && Boolean(institutionId),
    });
}
