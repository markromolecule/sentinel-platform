import { useQuery } from '@tanstack/react-query';
import { getClassroomInstructors } from '@sentinel/services';
import { useApi } from '../../api-provider';

export function useClassroomInstructorsQuery(classroomId: string) {
    const apiClient = useApi();

    return useQuery({
        queryKey: ['classrooms', classroomId, 'instructors'],
        queryFn: () => getClassroomInstructors(apiClient, classroomId),
        enabled: !!classroomId,
    });
}
