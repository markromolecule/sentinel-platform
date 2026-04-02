import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useDepartmentsQuery(search?: string, institutionId?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: [...DEPARTMENT_QUERY_KEYS.all, search, institutionId],
        queryFn: () => getDepartments(apiClient, search, institutionId),
        enabled: isAuthenticatedQueryEnabled,
    });
}
