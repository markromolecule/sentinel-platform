import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { MasterSubject } from '@sentinel/shared/types';
import { SubjectFormValues } from '@sentinel/shared/schema';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
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
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateSubject(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
