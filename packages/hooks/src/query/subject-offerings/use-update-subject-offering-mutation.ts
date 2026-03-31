import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSubjectOffering } from '@sentinel/services';
import type { SubjectOfferingUpdateFormValues } from '@sentinel/shared/schema';
import type { SubjectOffering } from '@sentinel/shared/types';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseUpdateSubjectOfferingMutationArgs = UseMutationOptions<
    SubjectOffering,
    Error,
    { id: string; payload: SubjectOfferingUpdateFormValues }
>;

export function useUpdateSubjectOfferingMutation(
    args: UseUpdateSubjectOfferingMutationArgs = {
        onSuccess: () => toast.success('Subject offering updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateSubjectOffering(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
