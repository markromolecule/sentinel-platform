import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../api-provider';
import { getStudentClassrooms } from '@sentinel/services';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export function useStudentClassroomsQuery() {
    const api = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery({
        queryKey: ['student-classrooms'],
        queryFn: () => getStudentClassrooms(api),
        enabled: isAuthenticatedQueryEnabled,
    });
}
