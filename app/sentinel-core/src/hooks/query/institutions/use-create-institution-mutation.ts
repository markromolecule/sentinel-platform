import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createInstitution } from '@/data';
import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

// Type for the arguments of the useCreateInstitutionMutation hook
export type UseCreateInstitutionMutationArgs = UseMutationOptions<
    Institution,
    Error,
    InstitutionInput
>;

/**
 * Hook to create an institution
 * Follows the pattern from useCreateDepartmentMutation
 */
export function useCreateInstitutionMutation(
    args: UseCreateInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createInstitution,
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
