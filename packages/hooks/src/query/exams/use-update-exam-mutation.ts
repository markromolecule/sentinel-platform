import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateExam, type UpdateExamPayload } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import type { ProctorExam } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateExamMutationArgs = UseMutationOptions<
    ProctorExam,
    Error,
    { id: string; payload: UpdateExamPayload }
>;

export function useUpdateExamMutation(
    args: UseUpdateExamMutationArgs = {
        onSuccess: () => toast.success('Exam updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateExam(apiClient, params),
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
