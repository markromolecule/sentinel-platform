import { useQuery } from '@tanstack/react-query';
import { getSemesters } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSemestersQuery(
    params: {
        search?: string;
        institutionId?: string | null;
        enabled?: boolean;
    } = {},
) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...SEMESTER_QUERY_KEYS.all, params.search, params.institutionId],
        queryFn: () =>
            getSemesters(apiClient, {
                search: params.search,
                institutionId: params.institutionId ?? undefined,
            }),
        enabled: isAuthenticatedQueryEnabled && (params.enabled ?? true),
    });
}
