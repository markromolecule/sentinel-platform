import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateExamStatus, type UpdateExamStatusPayload } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ProctorExam } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateExamStatusMutationArgs = UseMutationOptions<
    ProctorExam,
    Error,
    UpdateExamStatusPayload
>;

export function useUpdateExamStatusMutation(
    args: UseUpdateExamStatusMutationArgs = {
        onSuccess: () => toast.success('Exam status updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateExamStatus(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.details(variables.id) }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
