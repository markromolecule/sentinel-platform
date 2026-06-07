import type { AppNotification, NotificationList, NotificationStatus } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiResponse<T> {
    message: string;
    data: T;
}

export type GetNotificationsParams = {
    status?: NotificationStatus;
    limit?: number;
};

function buildNotificationsQueryString(params?: GetNotificationsParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.status) {
        searchParams.set('status', params.status);
    }

    if (params.limit !== undefined) {
        searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function getNotifications(
    apiClient: ApiClientType,
    params?: GetNotificationsParams,
): Promise<NotificationList> {
    const response: ApiResponse<NotificationList> = await apiClient(
        `/notifications${buildNotificationsQueryString(params)}`,
    );
    return response.data;
}

export async function markNotificationRead(
    apiClient: ApiClientType,
    notificationId: string,
): Promise<AppNotification> {
    const response: ApiResponse<AppNotification> = await apiClient(
        `/notifications/${notificationId}/read`,
        {
            method: 'POST',
        },
    );
    return response.data;
}

export async function markAllNotificationsRead(
    apiClient: ApiClientType,
): Promise<{ message: string; count: number }> {
    const response: ApiResponse<{ message: string; count: number }> = await apiClient(
        '/notifications/read-all',
        {
            method: 'POST',
        },
    );
    return response.data;
}
