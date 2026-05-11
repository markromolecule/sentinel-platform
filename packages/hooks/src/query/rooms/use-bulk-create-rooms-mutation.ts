import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { bulkCreateRooms } from '@sentinel/services';
import { Room, RoomInput } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';

export type UseBulkCreateRoomsMutationArgs = UseMutationOptions<Room[], Error, RoomInput[]>;

export function useBulkCreateRoomsMutation(args: UseBulkCreateRoomsMutationArgs = {}) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (rooms) => bulkCreateRooms(apiClient, rooms),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            if (args.onSuccess) {
                (args.onSuccess as any)(data, variables, context);
            }
        },
    });
}
