import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteSubjectMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteSubjectMutation(args: UseDeleteSubjectMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteSubject(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
            ]);
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Subject deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subjects',
                action: 'delete',
                permissionKey: 'subjects:delete',
            });
        },
    });
}
