'use client';

// import { DataFrame } from "@sentinel/ui"; // Assuming DataFrame or using DataTable directly - checking prompt context, user has DataTable in admin.
// User context showed: import { DataTable } from "@sentinel/ui"; in admin/announcements.
// Let's use DataTable as per admin example.

import { DataTable } from '@sentinel/ui';
import { columns } from './columns';
import { Notification } from '@sentinel/shared/types';

interface NotificationListProps {
    notifications: Notification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
    return (
        <DataTable
            columns={columns}
            data={notifications}
            searchKey="title"
            searchPlaceholder="Search notifications..."
        />
    );
}
