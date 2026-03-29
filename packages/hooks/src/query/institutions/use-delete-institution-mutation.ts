import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteInstitution } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteInstitutionMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteInstitutionMutation(
    args: UseDeleteInstitutionMutationArgs = {
        onSuccess: () => toast.success('Institution deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteInstitution(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
