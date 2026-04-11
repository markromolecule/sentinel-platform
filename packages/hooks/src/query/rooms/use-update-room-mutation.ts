import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { updateRoom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Room, RoomInput } from '@sentinel/shared/types';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseUpdateRoomMutationArgs = UseMutationOptions<
    Room,
    Error,
    { id: string; payload: Partial<RoomInput> }
>;

export function useUpdateRoomMutation(
    args: UseUpdateRoomMutationArgs = {
        onSuccess: () => toast.success('Room updated successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (params) => updateRoom(apiClient, params),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
