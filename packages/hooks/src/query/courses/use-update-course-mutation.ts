import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateCourse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Course } from '@sentinel/shared/types';
import { CourseFormValues } from '@sentinel/shared/schema';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyCoursePermissionError } from './course-permission-messages';

export type UseUpdateCourseMutationArgs = UseMutationOptions<
    Course,
    Error,
    { id: string; payload: Partial<CourseFormValues> }
>;

export function useUpdateCourseMutation(
    args: UseUpdateCourseMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateCourse(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Course updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyCoursePermissionError(error, 'update');
        },
    });
}
