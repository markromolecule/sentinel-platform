import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteQuestion } from '@sentinel/services';
import { QUESTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseDeleteQuestionMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteQuestionMutation(
    args: UseDeleteQuestionMutationArgs = {
        onSuccess: () => toast.success('Question deleted successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteQuestion(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: QUESTION_QUERY_KEYS.all,
                }),
                queryClient.removeQueries({
                    queryKey: QUESTION_QUERY_KEYS.details(variables),
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
