import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteSubjectMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteSubjectMutation(
    args: UseDeleteSubjectMutationArgs = {
        onSuccess: () => toast.success('Subject deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteSubject(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
