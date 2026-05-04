import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSubjectsQuery(
    search?: string,
    institutionIdOrEnabled?: string | boolean,
    enabled = true,
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const institutionId =
        typeof institutionIdOrEnabled === 'string' ? institutionIdOrEnabled : undefined;
    const queryEnabled =
        typeof institutionIdOrEnabled === 'boolean' ? institutionIdOrEnabled : enabled;

    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getSubjects(apiClient, search, institutionId),
        enabled: isAuthenticatedQueryEnabled && queryEnabled,
    });
}
