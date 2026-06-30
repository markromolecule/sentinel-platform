import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createFeedback, type CreateFeedbackSchemaValues, type FeedbackRecord } from '@sentinel/services';
import { FEEDBACK_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';

export type UseCreateFeedbackMutationArgs = UseMutationOptions<
    FeedbackRecord,
    Error,
    CreateFeedbackSchemaValues
>;

export function useCreateFeedbackMutation(args: UseCreateFeedbackMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => createFeedback(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: FEEDBACK_QUERY_KEYS.all });

            if (args.onSuccess) {
                await (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Feedback submitted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            toast.error(error.message || 'Failed to submit feedback');
        },
    });
}
