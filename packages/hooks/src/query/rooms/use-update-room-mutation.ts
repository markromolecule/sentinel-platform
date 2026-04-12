import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateRoom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Room, RoomInput } from '@sentinel/shared/types';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';
import { notifyPermissionDenied } from '../_shared/permission-errors';

export type UseUpdateRoomMutationArgs = UseMutationOptions<
    Room,
    Error,
    { id: string; payload: Partial<RoomInput> }
>;

export function useUpdateRoomMutation(
    args: UseUpdateRoomMutationArgs = {},
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateRoom(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Room updated successfully');
        },
        onError: (error, variables, context) => {
            if (args.onError) {
                (args.onError as any)(error, variables, context);
                return;
            }

            notifyPermissionDenied(error, {
                resourceName: 'rooms',
                action: 'update',
                permissionKey: 'rooms:update',
            });
        },
    });
}
