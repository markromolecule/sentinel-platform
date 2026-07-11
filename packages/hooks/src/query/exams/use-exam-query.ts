import { useQuery } from '@tanstack/react-query';
import { getExam, type GetExamParams } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamQuery(id?: string, params?: GetExamParams) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id ? [...EXAM_QUERY_KEYS.details(id), params ?? {}] : [...EXAM_QUERY_KEYS.all, 'detail'],
        queryFn: () => getExam(apiClient, id as string, params),
        enabled: Boolean(id) && isAuthenticatedQueryEnabled,
    });
}
