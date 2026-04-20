import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../api-provider';
import { getStudentClassrooms } from '@sentinel/services';

export function useStudentClassroomsQuery() {
    const api = useApi();

    return useQuery({
        queryKey: ['student-classrooms'],
        queryFn: () => getStudentClassrooms(api),
    });
}
