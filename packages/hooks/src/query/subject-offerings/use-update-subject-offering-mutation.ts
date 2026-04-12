import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSubjectOffering } from '@sentinel/services';
import type { SubjectOfferingUpdateFormValues } from '@sentinel/shared/schema';
import type { SubjectOffering } from '@sentinel/shared/types';
import { SUBJECT_OFFERING_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { useApi } from '../../api-provider';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateSubjectOfferingMutationArgs = UseMutationOptions<
    SubjectOffering,
    Error,
    { id: string; payload: SubjectOfferingUpdateFormValues }
>;

export function useUpdateSubjectOfferingMutation(
    args: UseUpdateSubjectOfferingMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => updateSubjectOffering(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Subject offering updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subject offerings',
                action: 'update',
                permissionKey: 'subject_offerings:update',
            });
        },
    });
}
