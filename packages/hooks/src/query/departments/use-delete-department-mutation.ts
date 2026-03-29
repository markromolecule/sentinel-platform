import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteDepartment } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteDepartmentMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteDepartmentMutation(
    args: UseDeleteDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteDepartment(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
