import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteEnrollmentRequests } from '@sentinel/services';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteEnrollmentRequestsMutationArgs = UseMutationOptions<number, Error, string[]>;

export function useDeleteEnrollmentRequestsMutation(
    args: UseDeleteEnrollmentRequestsMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (requestIds) => deleteEnrollmentRequests(apiClient, requestIds),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(
                data > 0
                    ? 'Selected enrollment requests deleted successfully.'
                    : 'No enrollment requests were deleted.',
            );
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subject requests',
                action: 'delete',
                actionLabel: 'delete enrollment requests',
                permissionKey: 'subject_requests:reject',
            });
        },
    });
}
