import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createDepartment } from '@/data';
import { Department, DepartmentInput } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useCreateDepartmentMutation hook
export type UseCreateDepartmentMutationArgs = UseMutationOptions<
    Department,
    Error,
    DepartmentInput
>;

// Hook to create a department
export function useCreateDepartmentMutation(
    args: UseCreateDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createDepartment,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
