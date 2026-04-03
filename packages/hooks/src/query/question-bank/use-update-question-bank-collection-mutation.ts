import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    updateQuestionBankCollection,
    type QuestionBankCollectionDetailRecord,
    type UpdateQuestionBankCollectionPayload,
} from '@sentinel/services';
import { QUESTION_BANK_COLLECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type Variables = {
    id: string;
    payload: UpdateQuestionBankCollectionPayload;
};

export type UseUpdateQuestionBankCollectionMutationArgs = UseMutationOptions<
    QuestionBankCollectionDetailRecord,
    Error,
    Variables
>;

export function useUpdateQuestionBankCollectionMutation(
    args: UseUpdateQuestionBankCollectionMutationArgs = {
        onSuccess: () => toast.success('Collection updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (variables) => updateQuestionBankCollection(apiClient, variables),
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
