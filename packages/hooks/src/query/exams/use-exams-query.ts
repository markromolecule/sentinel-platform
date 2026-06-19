import { useQuery } from '@tanstack/react-query';
import { getExams, type GetExamsParams } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuth } from '../../auth-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamsQuery(params?: GetExamsParams) {
    const apiClient = useApi();
    const { user } = useAuth();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...EXAM_QUERY_KEYS.all, user?.id ?? 'anonymous', params ?? {}],
        queryFn: () => getExams(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}
