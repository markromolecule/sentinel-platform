import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createExamSectionAssignment,
    type CreateExamSectionAssignmentPayload,
    type ExamSectionAssignmentRecord,
} from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseCreateExamSectionAssignmentMutationArgs = UseMutationOptions<
    ExamSectionAssignmentRecord,
    Error,
    { examId: string; payload: CreateExamSectionAssignmentPayload }
>;

/**
 * Mutation hook to assign a section to an exam.
 *
 * @param args - Standard Tanstack Query mutation options.
 * @returns Mutation object.
 */
export function useCreateExamSectionAssignmentMutation(
    args: UseCreateExamSectionAssignmentMutationArgs = {
        onSuccess: () => toast.success('Section assigned successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ examId, payload }) =>
            createExamSectionAssignment(apiClient, { examId, payload }),
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
