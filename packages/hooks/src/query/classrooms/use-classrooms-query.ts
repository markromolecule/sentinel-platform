import { useQuery } from '@tanstack/react-query';
import { getClassrooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { useAuth } from '../../auth-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseClassroomsQueryArgs = {
    search?: string;
    departmentId?: string;
    status?: 'active' | 'archived' | 'all';
    institutionId?: string;
    subjectId?: string;
    enabled?: boolean;
};

function normalizeClassroomQueryArgs(args?: string | UseClassroomsQueryArgs) {
    if (typeof args === 'string') {
        return {
            search: args,
            departmentId: undefined,
            status: 'active' as const,
            subjectId: undefined,
            enabled: undefined,
        };
    }

    return {
        search: args?.search,
        departmentId: args?.departmentId,
        status: args?.status ?? 'active',
        institutionId: args?.institutionId,
        subjectId: args?.subjectId,
        enabled: args?.enabled,
    };
}

/**
 * React Query hook to retrieve classrooms based on search, department, status, institution, and subject criteria.
 *
 * @param args - Search string or an object containing query parameters.
 * @returns React Query result containing classrooms list.
 */
export function useClassroomsQuery(args?: string | UseClassroomsQueryArgs) {
    const apiClient = useApi();
    const { user } = useAuth();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();
    const normalizedArgs = normalizeClassroomQueryArgs(args);

    return useQuery({
        queryKey: [...CLASSROOM_QUERY_KEYS.all, user?.id ?? 'anonymous', normalizedArgs],
        queryFn: () => getClassrooms(apiClient, normalizedArgs),
        enabled: isAuthenticatedQueryEnabled && (normalizedArgs.enabled ?? true),
    });
}
