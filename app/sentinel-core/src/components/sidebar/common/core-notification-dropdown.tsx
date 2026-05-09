'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useApi, useNotificationRealtime } from '@sentinel/hooks';
import { ApiError, getNotifications, markNotificationRead } from '@sentinel/services';
import { Button, cn } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';

type NotificationQueryResult = Awaited<ReturnType<typeof getNotifications>> & {
    forbidden?: boolean;
};

const NOTIFICATION_QUERY_KEY = ['notifications', 'core-header'] as const;

export function CoreNotificationDropdown() {
    const apiClient = useApi();
    const queryClient = useQueryClient();
    useNotificationRealtime({ queryKey: NOTIFICATION_QUERY_KEY });

    const { data, isLoading } = useQuery<NotificationQueryResult>({
        queryKey: NOTIFICATION_QUERY_KEY,
        queryFn: async () => {
            try {
                return await getNotifications(apiClient, { limit: 5 });
            } catch (error) {
                if (error instanceof ApiError && error.status === 403) {
                    return {
                        items: [],
                        unreadCount: 0,
                        forbidden: true,
                    };
                }

                throw error;
            }
        },
        retry: false,
    });

    const markReadMutation = useMutation({
        mutationFn: (notificationId: string) => markNotificationRead(apiClient, notificationId),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: NOTIFICATION_QUERY_KEY,
            });
        },
    });

    if (isLoading || data?.forbidden) {
        return null;
    }

    const unreadCount = data?.unreadCount ?? 0;
    const recentNotifications = (data?.items ?? []).slice(0, 5);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Open notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="bg-destructive absolute top-2 right-2 h-2 w-2 rounded-full" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-muted-foreground text-xs">{unreadCount} unread</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentNotifications.length === 0 ? (
                    <div className="text-muted-foreground p-4 text-sm">No notifications yet.</div>
                ) : (
                    recentNotifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex cursor-pointer flex-col items-start gap-1 p-3"
                            onClick={() => {
                                if (notification.status === 'UNREAD') {
                                    markReadMutation.mutate(notification.id);
                                }
                            }}
                        >
                            <div className="flex w-full items-start justify-between gap-3">
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        notification.status === 'UNREAD' && 'text-primary',
                                    )}
                                >
                                    {notification.title}
                                </span>
                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2 text-xs">
                                {notification.message}
                            </p>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
