import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { deleteNotifications } from '@sentinel/services';
import { useApi } from '../../api-provider';
import { toast } from 'sonner';

export type UseDeleteNotificationsMutationArgs = {
    queryKey: readonly unknown[];
    options?: UseMutationOptions<{ message: string; count: number }, Error, string[]>;
};

/**
 * Hook to bulk-delete the authenticated user's notifications.
 *
 * @param args Query key to invalidate and optional mutation callbacks.
 */
export function useDeleteNotificationsMutation({
    queryKey,
    options = {},
}: UseDeleteNotificationsMutationArgs) {
    const queryClient = useQueryClient();
    const apiClient = useApi();

    return useMutation({
        ...options,
        mutationFn: (notificationIds) => deleteNotifications(apiClient, notificationIds),
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({ queryKey });
            if (options.onSuccess) {
                await (options.onSuccess as any)(data, variables, context);
                return;
            }

            toast.success('Notifications deleted successfully');
        },
        onError: (error, variables, context) => {
            if (options.onError) {
                (options.onError as any)(error, variables, context);
                return;
            }

            toast.error(error.message || 'Failed to delete notifications');
        },
    });
}
