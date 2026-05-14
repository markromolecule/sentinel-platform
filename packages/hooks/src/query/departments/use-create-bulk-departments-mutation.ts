import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createBulkDepartments } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Department, DepartmentInput } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseCreateBulkDepartmentsMutationArgs = UseMutationOptions<
    Department[],
    Error,
    { departments: DepartmentInput[] }
>;

export function useCreateBulkDepartmentsMutation(args: UseCreateBulkDepartmentsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createBulkDepartments(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${data.length} departments created successfully`);
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'departments',
                action: 'create',
                permissionKey: 'departments:create',
            });
        },
    });
}
