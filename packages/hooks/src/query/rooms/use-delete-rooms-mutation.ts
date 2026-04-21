import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteRooms } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteRoomsMutationArgs = UseMutationOptions<void, Error, string[]>;

export function useDeleteRoomsMutation(args: UseDeleteRoomsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (ids) => deleteRooms(apiClient, ids),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success(`${variables.length} room(s) deleted successfully`);
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'rooms',
                action: 'delete',
                permissionKey: 'rooms:delete',
            });
        },
    });
}
