import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createCourse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Course, CourseInput } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateCourseMutationArgs = UseMutationOptions<
    Course,
    Error,
    CourseInput
>;

export function useCreateCourseMutation(
    args: UseCreateCourseMutationArgs = {
        onSuccess: () => toast.success('Course created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createCourse(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
