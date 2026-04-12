import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createSubject } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { MasterSubject } from '@sentinel/shared/types';
import { SubjectFormValues } from '@sentinel/shared/schema';
import { SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseCreateSubjectMutationArgs = UseMutationOptions<
    MasterSubject,
    Error,
    SubjectFormValues
>;

export function useCreateSubjectMutation(
    args: UseCreateSubjectMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createSubject(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Subject created successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subjects',
                action: 'create',
                permissionKey: 'subjects:create',
            });
        },
    });
}
