import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getQuestionBankCollections,
    type GetQuestionBankCollectionsParams,
    type QuestionBankCollectionPageRecord,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Returns the paginated question bank collections query result.
 */
export function useQuestionBankCollectionsQuery(
    params?: GetQuestionBankCollectionsParams,
): UseQueryResult<QuestionBankCollectionPageRecord, Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...QUESTION_BANK_COLLECTION_QUERY_KEYS.all, params ?? {}],
        queryFn: () => getQuestionBankCollections(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
