import { useQuery } from '@tanstack/react-query';
import { getExam } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useExamQuery(id?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id ? EXAM_QUERY_KEYS.details(id) : [...EXAM_QUERY_KEYS.all, 'detail'],
        queryFn: () => getExam(apiClient, id as string),
        enabled: Boolean(id) && isAuthenticatedQueryEnabled,
    });
}
