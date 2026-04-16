import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteRoom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseDeleteRoomMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteRoomMutation(args: UseDeleteRoomMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteRoom(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Room deleted successfully');
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
