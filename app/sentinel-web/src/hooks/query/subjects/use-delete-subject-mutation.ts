import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { deleteSubject } from '@/data';
import { toast } from 'sonner';

export type UseDeleteSubjectMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteSubjectMutation(
    args: UseDeleteSubjectMutationArgs = {
        onSuccess: () => toast.success('Subject deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: deleteSubject,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
