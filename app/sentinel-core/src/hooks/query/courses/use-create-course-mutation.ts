import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCourse } from '@/data';
import { CourseInput } from '@sentinel/shared/types';
import { UseMutationOptions } from '@tanstack/react-query';
import { Course } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';

export type UseCreateCourseMutationArgs = UseMutationOptions<Course, Error, CourseInput>;

export function useCreateCourseMutation(
    args: UseCreateCourseMutationArgs = {
        onSuccess: () => toast.success('Course created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createCourse,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
