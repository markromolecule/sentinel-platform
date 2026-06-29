import { useQuery } from '@tanstack/react-query';
import { getSubjectOffering } from '@sentinel/services';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

/**
 * Custom hook to query detailed metadata for a single subject offering.
 *
 * @param id The ID of the subject offering to retrieve.
 * @param enabled Optional parameter to control if the query runs automatically.
 */
export function useSubjectOfferingQuery(id: string, enabled = true) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...SUBJECT_OFFERING_QUERY_KEYS.details(id)],
        queryFn: () => getSubjectOffering(apiClient, id),
        enabled: isAuthenticatedQueryEnabled && enabled && Boolean(id),
    });
}
