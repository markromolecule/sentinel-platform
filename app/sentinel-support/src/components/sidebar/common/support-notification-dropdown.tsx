'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useApi, useNotificationRealtime } from '@sentinel/hooks';
import { formatDistanceToNow } from 'date-fns';
import { ApiError, getNotifications, markNotificationRead, markAllNotificationsRead } from '@sentinel/services';
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

const NOTIFICATION_QUERY_KEY = ['notifications', 'support-header'] as const;

export function SupportNotificationDropdown() {
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

    const markAllReadMutation = useMutation({
        mutationFn: () => markAllNotificationsRead(apiClient),
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
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors outline-none"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllReadMutation.mutate();
                            }}
                            disabled={markAllReadMutation.isPending}
                        >
                            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator />
                {recentNotifications.length === 0 ? (
                    <div className="text-muted-foreground p-4 text-sm">No notifications yet.</div>
                ) : (
                    recentNotifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className={cn(
                                "flex cursor-pointer flex-col items-start gap-1.5 p-4 transition-colors",
                                notification.status === 'UNREAD'
                                    ? 'bg-background hover:bg-accent'
                                    : 'hover:bg-accent opacity-80'
                            )}
                            onClick={() => {
                                if (notification.status === 'UNREAD') {
                                    markReadMutation.mutate(notification.id);
                                }
                            }}
                        >
                            <div className="flex w-full items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {notification.status === 'UNREAD' && (
                                        <span className="bg-primary h-2 w-2 flex-shrink-0 rounded-full" />
                                    )}
                                    <span
                                        className={cn(
                                            'text-sm font-semibold',
                                            notification.status === 'UNREAD'
                                                ? 'text-foreground'
                                                : 'text-foreground/80',
                                        )}
                                    >
                                        {notification.title}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                        addSuffix: true,
                                    })}
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
