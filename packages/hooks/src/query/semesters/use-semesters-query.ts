import { useQuery } from '@tanstack/react-query';
import { getSemesters } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useSemestersQuery(search?: string, institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    return useQuery({
        queryKey: [...SEMESTER_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getSemesters(apiClient, search, institutionId),
        enabled: isAuthenticatedQueryEnabled,
    });
}
