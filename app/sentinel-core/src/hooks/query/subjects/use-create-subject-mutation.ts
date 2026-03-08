import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { type SubjectFormValues } from '@sentinel/shared/schema';
import { type MasterSubject } from '@sentinel/shared/types';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { createSubject } from '@/data';
import { toast } from 'sonner';

export type UseCreateSubjectMutationArgs = UseMutationOptions<
    MasterSubject,
    Error,
    SubjectFormValues
>;

export function useCreateSubjectMutation(
    args: UseCreateSubjectMutationArgs = {
        onSuccess: () => toast.success('Subject created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();

    return useMutation({
        ...args,
        mutationFn: createSubject,
        onSuccess: async (...params) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            args.onSuccess?.(...params);
        },
        onError: (...params) => {
            args.onError?.(...params);
        },
    });
}
