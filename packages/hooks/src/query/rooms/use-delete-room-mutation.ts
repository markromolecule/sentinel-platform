import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteRoom } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { ROOM_QUERY_KEYS } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export type UseDeleteRoomMutationArgs = UseMutationOptions<void, Error, string>;

export function useDeleteRoomMutation(
    args: UseDeleteRoomMutationArgs = {
        onSuccess: () => toast.success('Room deleted successfully'),
        onError: (error: Error) => toast.error(error.message),
    },
) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...args,
        mutationFn: (id) => deleteRoom(apiClient, id),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey: ROOM_QUERY_KEYS.all });
            (args.onSuccess as any)?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            (args.onError as any)?.(error, variables, context);
        },
    });
}
