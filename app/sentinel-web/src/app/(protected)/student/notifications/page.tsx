'use client';

import { Bell } from 'lucide-react';
import { Separator } from '@sentinel/ui';
import { NotificationList } from '@/app/(protected)/student/notifications/_components/notification-list';
import { useEffect, useMemo, useState } from 'react';
import {
    useDeleteNotificationsMutation,
    useNotificationRealtime,
    useNotificationsQuery,
} from '@sentinel/hooks';
import type { AppNotification } from '@sentinel/services';
import { mapAppNotificationToStudentNotification } from './_lib/map-app-notification-to-student-notification';

const NOTIFICATION_QUERY_KEY = ['notifications', 'student-notifications'] as const;

export default function NotificationsPage() {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    useNotificationRealtime({ queryKey: NOTIFICATION_QUERY_KEY });

    const { data, isLoading } = useNotificationsQuery({
        queryKey: NOTIFICATION_QUERY_KEY,
        params: { limit: 20 },
    });

    const deleteNotificationsMutation = useDeleteNotificationsMutation({
        queryKey: NOTIFICATION_QUERY_KEY,
    });

    const notifications = useMemo(() => {
        return (data?.items ?? []).map((notification) =>
            mapAppNotificationToStudentNotification(notification as AppNotification),
        );
    }, [data?.items]);

    useEffect(() => {
        setRowSelection({});
    }, [notifications]);

    const selectedNotificationIds = useMemo(() => {
        return Object.entries(rowSelection)
            .filter(([, isSelected]) => Boolean(isSelected))
            .map(([rowId]) => notifications[Number(rowId)]?.id)
            .filter((notificationId): notificationId is string => Boolean(notificationId));
    }, [notifications, rowSelection]);

    const handleDeleteSelected = () => {
        if (selectedNotificationIds.length === 0) {
            return;
        }

        deleteNotificationsMutation.mutate(selectedNotificationIds, {
            onSuccess: () => {
                setRowSelection({});
            },
        });
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Bell className="h-6 w-6 text-[#323d8f]" />
                        <span className="bg-gradient-to-r from-[#323d8f] to-[#4a5bb8] bg-clip-text text-transparent">
                            Notifications
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Stay updated with your exams, classes, and system alerts.
                    </p>
                </div>
            </div>

            <Separator />

            <NotificationList
                notifications={notifications}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                onDeleteSelected={handleDeleteSelected}
                isDeleting={deleteNotificationsMutation.isPending}
                isLoading={isLoading}
            />
        </div>
    );
}
