import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createDepartment } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Department, DepartmentInput } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateDepartmentMutationArgs = UseMutationOptions<
    Department,
    Error,
    DepartmentInput
>;

export function useCreateDepartmentMutation(
    args: UseCreateDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createDepartment(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
