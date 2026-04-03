import { useQuery } from '@tanstack/react-query';
import { getQuestionBankCollection } from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useQuestionBankCollectionQuery(id?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id ? QUESTION_BANK_COLLECTION_QUERY_KEYS.details(id) : QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
        queryFn: () => getQuestionBankCollection(apiClient, id!),
        enabled: isAuthenticatedQueryEnabled && Boolean(id),
    });
}
