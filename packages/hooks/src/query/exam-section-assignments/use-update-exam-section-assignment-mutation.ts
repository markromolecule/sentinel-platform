import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    updateExamSectionAssignment,
    type UpdateExamSectionAssignmentPayload,
    type ExamSectionAssignmentRecord,
} from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateExamSectionAssignmentMutationArgs = UseMutationOptions<
    ExamSectionAssignmentRecord,
    Error,
    { examId: string; id: string; payload: UpdateExamSectionAssignmentPayload }
>;

/**
 * Mutation hook to update an exam section assignment.
 *
 * @param args - Standard Tanstack Query mutation options.
 * @returns Mutation object.
 */
export function useUpdateExamSectionAssignmentMutation(
    args: UseUpdateExamSectionAssignmentMutationArgs = {
        onSuccess: () => toast.success('Assignment updated successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ examId, id, payload }) =>
            updateExamSectionAssignment(apiClient, { examId, id, payload }),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: EXAM_QUERY_KEYS.sectionAssignments(variables.examId),
            });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
