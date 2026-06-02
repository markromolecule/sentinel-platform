'use client';

import { DataTable } from '@sentinel/ui';
import { Announcement } from '@sentinel/services';
import { columns } from './columns';

interface AnnouncementsListProps {
    announcements: Announcement[];
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
        />
    );
}

