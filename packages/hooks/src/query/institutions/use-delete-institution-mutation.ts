import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteInstitution } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { INSTITUTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteInstitutionMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteInstitutionMutation(
    args: UseDeleteInstitutionMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteInstitution(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: INSTITUTION_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Institution deleted successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'institutions',
                action: 'delete',
                permissionKey: 'institutions:delete',
            });
        },
    });
}
