import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateCourse } from '@/data';
import { CourseInput } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

export function useUpdateCourseMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CourseInput }) =>
            updateCourse({ id, payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: COURSE_QUERY_KEYS.all,
            });
            toast.success('Course updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update course');
        },
    });
}
