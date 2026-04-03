import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteExam } from '@sentinel/services';
import { EXAM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseDeleteExamMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteExamMutation(
    args: UseDeleteExamMutationArgs = {
        onSuccess: () => toast.success('Exam deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteExam(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: EXAM_QUERY_KEYS.all }),
                queryClient.removeQueries({ queryKey: EXAM_QUERY_KEYS.details(variables) }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
