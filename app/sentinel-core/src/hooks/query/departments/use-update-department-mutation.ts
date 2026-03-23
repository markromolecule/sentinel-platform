import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateDepartment } from '@/data';
import { Department, DepartmentInput } from '@sentinel/shared/types';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the input of the updateDepartment function
export type UpdateDepartmentInput = { id: string; payload: DepartmentInput };

// Type for the arguments of the useUpdateDepartmentMutation hook
export type UseUpdateDepartmentMutationArgs = UseMutationOptions<
    Department,
    Error,
    UpdateDepartmentInput
>;

// Hook to update a department
export function useUpdateDepartmentMutation(
    args: UseUpdateDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateDepartment,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
