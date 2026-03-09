import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { updateSubject } from '@/data';
import { toast } from 'sonner';

export type UseUpdateSubjectMutationArgs = UseMutationOptions<
    MasterSubject,
    Error,
    { id: string; payload: Partial<SubjectFormValues> }
>;

export function useUpdateSubjectMutation(
    args: UseUpdateSubjectMutationArgs = {
        onSuccess: () => toast.success('Subject updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: updateSubject,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
