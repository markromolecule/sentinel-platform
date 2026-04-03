import { useQuery } from '@tanstack/react-query';
import { getQuestionTypes } from '@sentinel/services';
import { QUESTION_TYPE_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionTypesQuery() {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: QUESTION_TYPE_QUERY_KEYS.all,
        queryFn: () => getQuestionTypes(apiClient),
        enabled: isAuthenticatedQueryEnabled,
    });
}
