import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSemesters } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SEMESTER_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteSemestersMutationArgs = UseMutationOptions<void, Error, string[]>;

export function useDeleteSemestersMutation(args: UseDeleteSemestersMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => deleteSemesters(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SEMESTER_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${variables.length} semester(s) deleted successfully`);
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'semesters',
                action: 'delete',
                permissionKey: 'semesters:delete',
            });
        },
    });
}
