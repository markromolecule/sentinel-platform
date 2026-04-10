import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createRoom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { Room, RoomInput } from '@sentinel/shared/types';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseCreateRoomMutationArgs = UseMutationOptions<Room, Error, RoomInput>;

export function useCreateRoomMutation(
    args: UseCreateRoomMutationArgs = {
        onSuccess: () => toast.success('Room created successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (payload) => createRoom(apiClient, payload),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
