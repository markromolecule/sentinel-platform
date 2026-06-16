import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    shareQuestionBankCollection,
    type QuestionBankCollectionShareRecord,
    type ShareQuestionBankCollectionPayload,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type Variables = {
    id: string;
    payload: ShareQuestionBankCollectionPayload;
};

export type UseShareQuestionBankCollectionMutationArgs = UseMutationOptions<
    QuestionBankCollectionShareRecord[],
    Error,
    Variables
>;

/**
 * Shares a collection with a replacement user list.
 */
export function useShareQuestionBankCollectionMutation(
    args: UseShareQuestionBankCollectionMutationArgs = {
        onSuccess: () => toast.success('Collection shares updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (variables) => shareQuestionBankCollection(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.details(variables.id),
                }),
                queryClient.invalidateQueries({
                    queryKey: [...QUESTION_BANK_COLLECTION_QUERY_KEYS.details(variables.id), 'shares'],
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
