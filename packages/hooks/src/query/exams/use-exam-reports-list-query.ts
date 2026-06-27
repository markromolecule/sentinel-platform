import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getExamReportsList, type GetExamReportsParams } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ProctorExam } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuth } from '../../auth-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

type UseExamReportsListQueryOptions = Omit<
    UseQueryOptions<
        { data: ProctorExam[]; meta: any },
        Error,
        { data: ProctorExam[]; meta: any },
        readonly unknown[]
    >,
    'queryKey' | 'queryFn'
>;

/**
 * React Query hook for fetching a paginated list of exam reports.
 *
 * @param params - Optional search and pagination params.
 * @param options - Query options.
 */
export function useExamReportsListQuery(
    params?: GetExamReportsParams,
    options?: UseExamReportsListQueryOptions,
) {
    const apiClient = useApi();
    const { user } = useAuth();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...EXAM_QUERY_KEYS.all, 'reports-list', user?.id ?? 'anonymous', params ?? {}],
        queryFn: () => getExamReportsList(apiClient, params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        ...options,
        enabled: options?.enabled ?? isAuthenticatedQueryEnabled,
    });
}
