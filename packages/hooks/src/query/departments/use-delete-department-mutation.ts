import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteDepartment } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteDepartmentMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteDepartmentMutation(
    args: UseDeleteDepartmentMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteDepartment(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Department deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'departments',
                action: 'delete',
                permissionKey: 'departments:delete',
            });
        },
    });
}
