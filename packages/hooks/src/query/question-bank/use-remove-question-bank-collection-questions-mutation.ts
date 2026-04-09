import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    removeQuestionBankCollectionQuestions,
    type MutateQuestionBankCollectionQuestionsPayload,
    type QuestionBankCollectionDetailRecord,
} from '@sentinel/services';
import {
    BUILDER_QUERY_KEYS,
    EXAM_QUERY_KEYS,
    QUESTION_BANK_COLLECTION_QUERY_KEYS,
} from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

type Variables = {
    id: string;
    payload: MutateQuestionBankCollectionQuestionsPayload;
};

export type UseRemoveQuestionBankCollectionQuestionsMutationArgs = UseMutationOptions<
    QuestionBankCollectionDetailRecord,
    Error,
    Variables
>;

export function useRemoveQuestionBankCollectionQuestionsMutation(
    args: UseRemoveQuestionBankCollectionQuestionsMutationArgs = {
        onSuccess: () => toast.success('Questions removed from collection.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (variables) => removeQuestionBankCollectionQuestions(apiClient, variables),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: QUESTION_BANK_COLLECTION_QUERY_KEYS.details(data.id),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: BUILDER_QUERY_KEYS.all,
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
