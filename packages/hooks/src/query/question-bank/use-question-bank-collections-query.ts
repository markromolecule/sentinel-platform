import { useQuery } from '@tanstack/react-query';
import {
    getQuestionBankCollections,
    type GetQuestionBankCollectionsParams,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionBankCollectionsQuery(params?: GetQuestionBankCollectionsParams) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...QUESTION_BANK_COLLECTION_QUERY_KEYS.all, params ?? {}],
        queryFn: () => getQuestionBankCollections(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
