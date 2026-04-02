import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSelectedSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteSelectedSubjectsMutationArgs = UseMutationOptions<number, Error, string[]>;

export function useDeleteSelectedSubjectsMutation(
    args: UseDeleteSelectedSubjectsMutationArgs = {
        onSuccess: (deletedCount) =>
            toast.success(
                deletedCount > 0
                    ? `Deleted ${deletedCount} subject${deletedCount === 1 ? '' : 's'} successfully`
                    : 'No subjects were deleted',
            ),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (subjectIds) => deleteSelectedSubjects(apiClient, subjectIds),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
            ]);
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
