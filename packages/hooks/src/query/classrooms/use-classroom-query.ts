import { useQuery } from '@tanstack/react-query';
import { getClassroom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { CLASSROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useClassroomQuery(id?: string) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: id
            ? CLASSROOM_QUERY_KEYS.details(id)
            : [...CLASSROOM_QUERY_KEYS.all, 'missing-id'],
        queryFn: () => getClassroom(apiClient, id as string),
        enabled: isAuthenticatedQueryEnabled && Boolean(id),
    });
}
