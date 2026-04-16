import { useQuery } from '@tanstack/react-query';
import { getSubjectClassifications } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_CLASSIFICATION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSubjectClassificationsQuery(search?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...SUBJECT_CLASSIFICATION_QUERY_KEYS.all, search],
        queryFn: () => getSubjectClassifications(apiClient, search),
        enabled: isAuthenticatedQueryEnabled,
    });
}
