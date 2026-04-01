import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSubjectOffering } from '@sentinel/services';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseDeleteSubjectOfferingMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteSubjectOfferingMutation(
    args: UseDeleteSubjectOfferingMutationArgs = {
        onSuccess: () => toast.success('Subject offering removed successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteSubjectOffering(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
