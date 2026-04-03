import { useQuery } from '@tanstack/react-query';
import { getQuestion } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionQuery(id?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id ? QUESTION_QUERY_KEYS.details(id) : QUESTION_QUERY_KEYS.all,
        queryFn: () => getQuestion(apiClient, id as string),
        enabled: isAuthenticatedQueryEnabled && Boolean(id),
    });
}
