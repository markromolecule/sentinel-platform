import { useQuery } from '@tanstack/react-query';
import { getQuestionTypeCounts, type GetQuestionTypeCountsParams } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Hook to fetch counts of questions grouped by their type, filtered by the given parameters.
 *
 * @param params - Optional query parameters like search, collectionId, difficulty, etc.
 * @returns React Query result containing the aggregated counts.
 */
export function useQuestionTypeCountsQuery(params?: GetQuestionTypeCountsParams) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: QUESTION_QUERY_KEYS.typeCounts(params ?? {}),
        queryFn: () => getQuestionTypeCounts(apiClient, params),
        enabled: isAuthenticatedQueryEnabled,
    });
}
