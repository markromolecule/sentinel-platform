import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
    getQuestionBankCollectionShares,
    type QuestionBankCollectionShareRecord,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Loads the users currently shared with a collection.
 */
export function useQuestionBankCollectionSharesQuery(
    id?: string,
): UseQueryResult<QuestionBankCollectionShareRecord[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id
            ? [...QUESTION_BANK_COLLECTION_QUERY_KEYS.details(id), 'shares']
            : ['question-bank', 'collections', 'shares'],
        queryFn: () => getQuestionBankCollectionShares(apiClient, id!),
        enabled: isAuthenticatedQueryEnabled && Boolean(id),
    });
}
