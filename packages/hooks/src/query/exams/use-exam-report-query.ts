import { useQuery } from '@tanstack/react-query';
import { getExamReport } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamReportQuery(examId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: examId ? EXAM_QUERY_KEYS.report(examId) : [...EXAM_QUERY_KEYS.all, 'report'],
        queryFn: () => getExamReport(apiClient, examId as string),
        enabled: Boolean(examId) && isAuthenticatedQueryEnabled,
    });
}
