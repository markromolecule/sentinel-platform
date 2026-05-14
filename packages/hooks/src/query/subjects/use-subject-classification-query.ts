import { useQuery } from '@tanstack/react-query';
import { getSubjectClassification } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_CLASSIFICATION_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSubjectClassificationQuery(id: string, institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...SUBJECT_CLASSIFICATION_QUERY_KEYS.all, id, institutionId],
        queryFn: () => getSubjectClassification(apiClient, id, institutionId),
        enabled: isAuthenticatedQueryEnabled && !!id,
    });
}
