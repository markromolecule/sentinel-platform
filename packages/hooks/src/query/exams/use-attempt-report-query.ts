import { useQuery } from '@tanstack/react-query';
import { getAttemptReport } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Fetches the detailed attempt report contract used by instructor and student
 * report views.
 */
export function useAttemptReportQuery(attemptId?: string | null) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: attemptId
            ? EXAM_QUERY_KEYS.attemptReport(attemptId)
            : [...EXAM_QUERY_KEYS.all, 'attempt-report'],
        queryFn: () => getAttemptReport(apiClient, attemptId!),
        enabled: isAuthenticatedQueryEnabled && Boolean(attemptId),
        retry: false,
    });
}
