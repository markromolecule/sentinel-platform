import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Course } from '@sentinel/shared/types';
import { updateCourse } from '@/data';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { UseMutationOptions } from '@tanstack/react-query';
import { CourseFormValues } from '@sentinel/shared/schema';

export type UseUpdateCourseMutationArgs = UseMutationOptions<
    Course,
    Error,
    { id: string; payload: Partial<CourseFormValues> }
>;

export function useUpdateCourseMutation(
    args: UseUpdateCourseMutationArgs = {
        onSuccess: () => toast.success('Course updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateCourse,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
