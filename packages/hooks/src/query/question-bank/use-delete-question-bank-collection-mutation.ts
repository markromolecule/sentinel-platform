import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteQuestionBankCollection } from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseDeleteQuestionBankCollectionMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteQuestionBankCollectionMutation(
    args: UseDeleteQuestionBankCollectionMutationArgs = {
        onSuccess: () => toast.success('Collection deleted successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteQuestionBankCollection(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
