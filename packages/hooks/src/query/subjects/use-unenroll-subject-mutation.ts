import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { unenrollInstructorSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUnenrollSubjectMutationArgs = UseMutationOptions<
    void,
    Error,
    { id: string; status?: string; classGroupIds?: string[] }
>;

export function useUnenrollSubjectMutation(
    args: UseUnenrollSubjectMutationArgs = {
        onSuccess: () => toast.success('Subject removed successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: ({ id, status, classGroupIds }: { id: string; status?: string; classGroupIds?: string[] }) => unenrollInstructorSubject(apiClient, id, status, classGroupIds),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
