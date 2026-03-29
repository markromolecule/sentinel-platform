import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createInstitution } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateInstitutionMutationArgs = UseMutationOptions<
    Institution,
    Error,
    InstitutionInput
>;

export function useCreateInstitutionMutation(
    args: UseCreateInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createInstitution(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
