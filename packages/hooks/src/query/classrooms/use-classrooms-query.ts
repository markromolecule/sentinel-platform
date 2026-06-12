import { useQuery } from '@tanstack/react-query';
import { getClassrooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseClassroomsQueryArgs = {
    search?: string;
    departmentId?: string;
    status?: 'active' | 'archived' | 'all';
};

function normalizeClassroomQueryArgs(args?: string | UseClassroomsQueryArgs) {
    if (typeof args === 'string') {
        return { search: args, departmentId: undefined, status: 'active' as const };
    }

    return {
        search: args?.search,
        departmentId: args?.departmentId,
        status: args?.status ?? 'active',
    };
}

export function useClassroomsQuery(args?: string | UseClassroomsQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const normalizedArgs = normalizeClassroomQueryArgs(args);

    return useQuery({
        queryKey: [...CLASSROOM_QUERY_KEYS.all, normalizedArgs],
        queryFn: () => getClassrooms(apiClient, normalizedArgs),
        enabled: isAuthenticatedQueryEnabled,
    });
}
