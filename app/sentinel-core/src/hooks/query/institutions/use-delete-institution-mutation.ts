import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteInstitution } from '@/data';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useDeleteInstitutionMutation hook
export type UseDeleteInstitutionMutationArgs = UseMutationOptions<
    void,
    Error,
    string
>;

/**
 * Hook to delete an institution
 * Follows the pattern from useDeleteDepartmentMutation
 */
export function useDeleteInstitutionMutation(
    args: UseDeleteInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: deleteInstitution,
        onSuccess: async (data, variables, context) => {
            // Invalidate the list and the specific details
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.details(variables) }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
