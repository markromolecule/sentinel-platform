import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import {
    createExamSectionAssignmentsBatch,
    type CreateExamSectionAssignmentBatchItemPayload,
    type ExamSectionAssignmentRecord,
} from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseCreateExamSectionAssignmentsBatchMutationArgs = UseMutationOptions<
    ExamSectionAssignmentRecord[],
    Error,
    { examId: string; payload: { assignments: CreateExamSectionAssignmentBatchItemPayload[] } }
>;

/**
 * Mutation hook to batch assign sections to an exam.
 *
 * @param args - Standard Tanstack Query mutation options.
 * @returns Mutation object.
 */
export function useCreateExamSectionAssignmentsBatchMutation(
    args: UseCreateExamSectionAssignmentsBatchMutationArgs = {
        onSuccess: () => toast.success('Sections assigned successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ examId, payload }) =>
            createExamSectionAssignmentsBatch(apiClient, { examId, payload }),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.sectionAssignments(variables.examId),
                }),
                queryClient.invalidateQueries({
                    queryKey: EXAM_QUERY_KEYS.all,
                }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
