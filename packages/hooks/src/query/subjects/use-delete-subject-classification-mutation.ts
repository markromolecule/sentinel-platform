import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSubjectClassification } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SUBJECT_CLASSIFICATION_QUERY_KEYS, SUBJECT_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type DeleteSubjectClassificationMutationInput = {
    id: string;
    institutionId?: string;
};

export type UseDeleteSubjectClassificationMutationArgs = UseMutationOptions<
    void,
    Error,
    DeleteSubjectClassificationMutationInput
>;

export function useDeleteSubjectClassificationMutation(
    args: UseDeleteSubjectClassificationMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => deleteSubjectClassification(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: SUBJECT_CLASSIFICATION_QUERY_KEYS.all }),
                queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all }),
            ]);

            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Subject classification deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'subject classifications',
                action: 'delete',
                permissionKey: 'subjects:delete',
            });
        },
    });
}
