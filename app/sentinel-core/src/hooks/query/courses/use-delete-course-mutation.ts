import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteCourse } from '@/data';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

export function useDeleteCourseMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: COURSE_QUERY_KEYS.all,
            });
            toast.success('Course deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete course');
        },
    });
}
