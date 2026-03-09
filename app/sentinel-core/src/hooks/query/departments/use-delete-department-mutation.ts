import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteDepartment } from '@/data';
import { DEPARTMENT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useDeleteDepartmentMutation hook
export type UseDeleteDepartmentMutationArgs = UseMutationOptions<void, Error, string>;

// Hook to delete a department
export function useDeleteDepartmentMutation(
    args: UseDeleteDepartmentMutationArgs = {
        onSuccess: () => toast.success('Department deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: deleteDepartment,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
