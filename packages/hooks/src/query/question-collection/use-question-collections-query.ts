import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getQuestionCollections,
    type GetQuestionCollectionsParams,
    type QuestionCollectionPageRecord,
} from '@sentinel/services';
import { QUESTION_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Returns the paginated question collection query result.
 */
export function useQuestionCollectionsQuery(
    params?: GetQuestionCollectionsParams,
): UseQueryResult<QuestionCollectionPageRecord, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...QUESTION_COLLECTION_QUERY_KEYS.all, params ?? {}],
        queryFn: () => getQuestionCollections(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
