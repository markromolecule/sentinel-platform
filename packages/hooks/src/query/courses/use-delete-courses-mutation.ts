import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteCourses } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { COURSE_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteCoursesMutationArgs = UseMutationOptions<void, Error, string[]>;

export function useDeleteCoursesMutation(args: UseDeleteCoursesMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => deleteCourses(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: COURSE_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${variables.length} course(s) deleted successfully`);
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'courses',
                action: 'delete',
                permissionKey: 'courses:delete',
            });
        },
    });
}
