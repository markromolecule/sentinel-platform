'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useApi } from '@sentinel/hooks';
import { useNotificationRealtime } from '@sentinel/hooks';
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

const NOTIFICATION_QUERY_KEY = ['notifications', 'instructor-header'] as const;

export function InstructorNotificationDropdown() {
    const apiClient = useApi();
    const queryClient = useQueryClient();
    useNotificationRealtime({ queryKey: NOTIFICATION_QUERY_KEY });

    const { data, isLoading } = useQuery({
        queryKey: NOTIFICATION_QUERY_KEY,
        queryFn: async () => {
            try {
                return await getNotifications(apiClient, { limit: 5 });
            } catch (error) {
                if (error instanceof ApiError && error.status === 403) {
                    return {
                        items: [],
                        unreadCount: 0,
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

    const unreadCount = data?.unreadCount ?? 0;
    const hasUnread = unreadCount > 0;

    const recentNotifications = useMemo(() => {
        return (data?.items ?? []).slice(0, 5);
    }, [data?.items]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
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
                {isLoading ? (
                    <div className="text-muted-foreground p-4 text-sm">
                        Loading notifications...
                    </div>
                ) : recentNotifications.length === 0 ? (
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
