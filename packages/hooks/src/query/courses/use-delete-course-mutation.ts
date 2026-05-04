import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteCourse } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyCoursePermissionError } from './course-permission-messages';

export type DeleteCourseVariables =
    | string
    | {
          id: string;
          institutionId?: string;
      };

export type UseDeleteCourseMutationArgs = UseMutationOptions<void, Error, DeleteCourseVariables>;

export function useDeleteCourseMutation(args: UseDeleteCourseMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (variables) =>
            typeof variables === 'string'
                ? deleteCourse(apiClient, variables)
                : deleteCourse(apiClient, variables.id, variables.institutionId),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Course deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyCoursePermissionError(error, 'delete');
        },
    });
}
