import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createQuestion, type CreateQuestionPayload, type QuestionRecord } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseCreateQuestionMutationArgs = UseMutationOptions<
    QuestionRecord,
    Error,
    CreateQuestionPayload
>;

export function useCreateQuestionMutation(
    args: UseCreateQuestionMutationArgs = {
        onSuccess: () => toast.success('Question created successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createQuestion(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: QUESTION_QUERY_KEYS.all,
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
