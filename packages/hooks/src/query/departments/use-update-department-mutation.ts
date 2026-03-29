import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateDepartment } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Department, DepartmentInput } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateDepartmentMutationArgs = UseMutationOptions<
    Department,
    Error,
    { id: string; payload: Partial<DepartmentInput> }
>;

export function useUpdateDepartmentMutation(
    args: UseUpdateDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateDepartment(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
