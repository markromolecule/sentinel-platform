import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { MasterSubject } from '@sentinel/shared/types';
import { SubjectFormValues } from '@sentinel/shared/schema';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateSubjectMutationArgs = UseMutationOptions<
    MasterSubject,
    Error,
    { id: string; payload: Partial<SubjectFormValues> }
>;

export function useUpdateSubjectMutation(
    args: UseUpdateSubjectMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateSubject(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Subject updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subjects',
                action: 'update',
                permissionKey: 'subjects:update',
            });
        },
    });
}
