import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { unenrollInstructorSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseBulkUnenrollInstructorSubjectsMutationArgs = UseMutationOptions<
    void[],
    Error,
    { id: string; status?: string; classGroupIds?: string[] }[]
>;

export function useBulkUnenrollInstructorSubjectsMutation(
    args: UseBulkUnenrollInstructorSubjectsMutationArgs = {
        onSuccess: () => toast.success('Selected subjects removed successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (subjectsToUnenroll) =>
            Promise.all(
                subjectsToUnenroll.map(({ id, status, classGroupIds }) =>
                    unenrollInstructorSubject(apiClient, id, status, classGroupIds),
                ),
            ),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
