import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createSubjectOffering } from '@sentinel/services';
import type { SubjectOfferingFormValues } from '@sentinel/shared/schema';
import type { SubjectOffering } from '@sentinel/shared/types';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';

export type UseCreateSubjectOfferingMutationArgs = UseMutationOptions<
    SubjectOffering,
    Error,
    SubjectOfferingFormValues
>;

export function useCreateSubjectOfferingMutation(
    args: UseCreateSubjectOfferingMutationArgs = {
        onSuccess: () => toast.success('Subject offering created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createSubjectOffering(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
