import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createQuestionBankCollection,
    type CreateQuestionBankCollectionPayload,
    type QuestionBankCollectionDetailRecord,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseCreateQuestionBankCollectionMutationArgs = UseMutationOptions<
    QuestionBankCollectionDetailRecord,
    Error,
    CreateQuestionBankCollectionPayload
>;

export function useCreateQuestionBankCollectionMutation(
    args: UseCreateQuestionBankCollectionMutationArgs = {
        onSuccess: () => toast.success('Collection created successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createQuestionBankCollection(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
            });
            await queryClient.invalidateQueries({
                queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.details(data.id),
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
