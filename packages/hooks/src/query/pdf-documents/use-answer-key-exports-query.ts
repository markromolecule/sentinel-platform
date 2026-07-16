import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
    getAnswerKeyExports,
    type ListAnswerKeyExportsParams,
    type PaginatedAnswerKeyExports,
} from '@sentinel/services';
import { ANALYTICS_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseAnswerKeyExportsQueryArgs = Omit<
    UseQueryOptions<PaginatedAnswerKeyExports, Error>,
    'queryKey' | 'queryFn'
> & {
    payload?: ListAnswerKeyExportsParams;
};

export function useAnswerKeyExportsQuery({
    payload,
    ...options
}: UseAnswerKeyExportsQueryArgs = {}) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<PaginatedAnswerKeyExports, Error>({
        ...options,
        queryKey: ANALYTICS_QUERY_KEYS.answerKeyExports(
            payload?.institutionId,
            payload?.examId,
            payload?.page,
            payload?.limit,
        ),
        queryFn: () => getAnswerKeyExports(apiClient, payload),
        enabled: isAuthenticatedQueryEnabled && (options.enabled ?? true),
    });
}
