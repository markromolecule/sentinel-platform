import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getAccessControlAssignments } from '@sentinel/services';
import { ACCESS_CONTROL_QUERY_KEYS } from '@sentinel/shared/constants';
import type { AccessControlAssignment } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useAccessControlAssignmentsQuery(
    search?: string,
): UseQueryResult<AccessControlAssignment[], Error> {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...ACCESS_CONTROL_QUERY_KEYS.assignments(), { search }],
        queryFn: () => getAccessControlAssignments(apiClient, search),
        enabled: isAuthenticatedQueryEnabled,
    });
}
