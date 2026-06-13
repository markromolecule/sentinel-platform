import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { assignExam, type ApiExamAssignment } from '@sentinel/services';
import { useApi } from '../../api-provider';

export type UseAssignExamMutationArgs = UseMutationOptions<
    ApiExamAssignment,
    Error,
    { examId: string; assigneeId: string }
>;

/**
 * Mutation hook to assign an exam to an instructor (proctor assignment).
 * Invalidates the 'exam-assignments' query cache upon successful execution.
 *
 * @param args TanStack Query mutation options
 * @returns TanStack Query mutation result
 */
export function useAssignExamMutation(args: UseAssignExamMutationArgs = {}) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: (payload) => assignExam(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: ['exam-assignments'],
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
