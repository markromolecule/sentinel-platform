import { useQuery, type QueryKey } from '@tanstack/react-query';
import { ApiError, getNotifications, type GetNotificationsParams } from '@sentinel/services';
import type { NotificationList } from '@sentinel/shared/types';
import { useApi } from '../../api-provider';
import { useAuthenticatedQueryEnabled } from '../_shared/use-authenticated-query-enabled';

export type UseNotificationsQueryArgs = {
    queryKey: QueryKey;
    params?: GetNotificationsParams;
    enabled?: boolean;
};

/**
 * Hook to fetch the authenticated user's notifications.
 *
 * @param args Query key and notification filter params.
 */
export function useNotificationsQuery({
    queryKey,
    params,
    enabled = true,
}: UseNotificationsQueryArgs) {
    const apiClient = useApi();
    const isAuthenticatedQueryEnabled = useAuthenticatedQueryEnabled();

    return useQuery<NotificationList>({
        queryKey,
        queryFn: async () => {
            try {
                return await getNotifications(apiClient, params);
            } catch (error) {
                if (error instanceof ApiError && error.status === 403) {
                    return {
                        items: [],
                        unreadCount: 0,
                        forbidden: true,
                    } as NotificationList;
                }

                throw error;
            }
        },
        enabled: isAuthenticatedQueryEnabled && enabled,
    });
}
