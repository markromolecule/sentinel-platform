import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteSections } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { SECTION_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteSectionsMutationArgs = UseMutationOptions<void, Error, string[]>;

export function useDeleteSectionsMutation(args: UseDeleteSectionsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => deleteSections(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: SECTION_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${variables.length} section(s) deleted successfully`);
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'sections',
                action: 'delete',
                permissionKey: 'sections:delete',
            });
        },
    });
}
