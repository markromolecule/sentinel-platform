import { useQuery } from '@tanstack/react-query';
import { getExams, type GetExamsParams } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamsQuery(params?: GetExamsParams) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...EXAM_QUERY_KEYS.all, params ?? {}],
        queryFn: () => getExams(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
