'use client';

import { DataTable } from '@sentinel/ui';
import { columns } from './columns';
import { Announcement } from '@sentinel/services';

interface AnnouncementsListProps {
    announcements: Announcement[];
    onEdit?: (announcement: Announcement) => void;
    onDelete?: (announcement: Announcement) => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

export function AnnouncementsList({
    announcements,
    onEdit,
    onDelete,
    searchTerm,
    onSearchChange,
}: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            meta={{ onEdit, onDelete }}
        />
    );
}

