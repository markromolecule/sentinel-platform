import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateInstitution } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Institution, InstitutionInput } from '@sentinel/shared/types';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateInstitutionMutationArgs = UseMutationOptions<
    Institution,
    Error,
    { id: string; payload: InstitutionInput }
>;

export function useUpdateInstitutionMutation(
    args: UseUpdateInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateInstitution(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
