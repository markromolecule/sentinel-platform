import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteDepartments } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteDepartmentsMutationArgs = UseMutationOptions<void, Error, string[]>;

export function useDeleteDepartmentsMutation(args: UseDeleteDepartmentsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => deleteDepartments(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${variables.length} department(s) deleted successfully`);
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
