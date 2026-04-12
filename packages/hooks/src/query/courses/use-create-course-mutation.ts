import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createCourse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Course, CourseInput } from '@sentinel/shared/types';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyCoursePermissionError } from './course-permission-messages';

export type UseCreateCourseMutationArgs = UseMutationOptions<
    Course,
    Error,
    CourseInput
>;

export function useCreateCourseMutation(
    args: UseCreateCourseMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createCourse(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Course created successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyCoursePermissionError(error, 'create');
        },
    });
}
