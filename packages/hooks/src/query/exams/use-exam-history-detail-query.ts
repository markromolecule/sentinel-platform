import { useQuery } from '@tanstack/react-query';
import { getExamHistoryDetail } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamHistoryDetailQuery(attemptId?: string | null) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: attemptId
            ? EXAM_QUERY_KEYS.historyDetail(attemptId)
            : [...EXAM_QUERY_KEYS.history(), 'detail'],
        queryFn: () => getExamHistoryDetail(apiClient, attemptId!),
        enabled: isAuthenticatedQueryEnabled && Boolean(attemptId),
    });
}
