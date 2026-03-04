import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createCourse } from '@/data';
import { CourseInput } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

export function useCreateCourseMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CourseInput) => createCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: COURSE_QUERY_KEYS.all,
            });
            toast.success('Course created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create course');
        },
    });
}
