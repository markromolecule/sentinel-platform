import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateInstitution } from '@/data';
import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useUpdateInstitutionMutation hook
export type UseUpdateInstitutionMutationArgs = UseMutationOptions<
    Institution,
    Error,
    { id: string; payload: InstitutionInput }
>;

/**
 * Hook to update an institution
 * Follows the pattern from useUpdateDepartmentMutation
 */
export function useUpdateInstitutionMutation(
    args: UseUpdateInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateInstitution,
        onSuccess: async (data, variables, context) => {
            // Invalidate both the list and the specific details
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.details(variables.id) }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
