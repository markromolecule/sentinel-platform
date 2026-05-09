'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { useApi } from '@sentinel/hooks';
import { useNotificationRealtime } from '@sentinel/hooks';
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
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="text-muted-foreground text-xs">{unreadCount} unread</span>
                </DropdownMenuLabel>
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
