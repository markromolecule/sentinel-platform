import { useQuery } from '@tanstack/react-query';
import { getQuestions, type GetQuestionsParams } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionsQuery(params?: GetQuestionsParams) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: QUESTION_QUERY_KEYS.list(params ?? {}),
        queryFn: () => getQuestions(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
