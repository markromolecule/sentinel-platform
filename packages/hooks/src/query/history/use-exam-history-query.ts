import { useQuery } from '@tanstack/react-query';
import { getExamHistory } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamHistoryQuery() {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: EXAM_QUERY_KEYS.history(),
        queryFn: () => getExamHistory(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
