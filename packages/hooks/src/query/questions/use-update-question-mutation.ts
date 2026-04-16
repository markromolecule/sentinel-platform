import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    updateQuestion,
    type QuestionRecord,
    type UpdateQuestionPayload,
} from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateQuestionMutationArgs = UseMutationOptions<
    QuestionRecord,
    Error,
    { id: string; payload: UpdateQuestionPayload }
>;

export function useUpdateQuestionMutation(
    args: UseUpdateQuestionMutationArgs = {
        onSuccess: () => toast.success('Question updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (params) => updateQuestion(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: QUESTION_QUERY_KEYS.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: QUESTION_QUERY_KEYS.details(variables.id),
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
