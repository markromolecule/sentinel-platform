import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteExamSectionAssignment } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseDeleteExamSectionAssignmentMutationArgs = UseMutationOptions<
    { id: string },
    Error,
    { examId: string; id: string }
>;

/**
 * Mutation hook to delete/remove a section assignment from an exam.
 *
 * @param args - Standard Tanstack Query mutation options.
 * @returns Mutation object.
 */
export function useDeleteExamSectionAssignmentMutation(
    args: UseDeleteExamSectionAssignmentMutationArgs = {
        onSuccess: () => toast.success('Assignment deleted successfully.'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const apiClient = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: ({ examId, id }) => deleteExamSectionAssignment(apiClient, { examId, id }),
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
