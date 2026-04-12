import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSelectedSubjects } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_OFFERING_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteSelectedSubjectsMutationArgs = UseMutationOptions<number, Error, string[]>;

export function useDeleteSelectedSubjectsMutation(
    args: UseDeleteSelectedSubjectsMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (subjectIds) => deleteSelectedSubjects(apiClient, subjectIds),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_OFFERING_QUERY_KEYS.all }),
            ]);
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(
                data > 0
                    ? `Deleted ${data} subject${data === 1 ? '' : 's'} successfully`
                    : 'No subjects were deleted',
            );
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subjects',
                action: 'delete',
                actionLabel: 'delete selected subjects',
                permissionKey: 'subjects:delete',
            });
        },
    });
}
