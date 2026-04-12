import { useQuery } from '@tanstack/react-query';
import { getExamConfiguration } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamConfigurationQuery(examId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: examId
            ? EXAM_QUERY_KEYS.configuration(examId)
            : [...EXAM_QUERY_KEYS.all, 'configuration'],
        queryFn: () => getExamConfiguration(apiClient, examId as string),
        enabled: Boolean(examId) && isAuthenticatedQueryEnabled,
    });
}
