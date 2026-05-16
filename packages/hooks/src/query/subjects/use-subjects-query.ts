import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSubjectsQuery(
    params: {
        search?: string;
        institutionId?: string | null;
        enabled?: boolean;
    } = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...SUBJECT_QUERY_KEYS.all, params.search, params.institutionId],
        queryFn: () =>
            getSubjects(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
            }),
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
