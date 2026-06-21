'use client';

import { DataTable } from '@sentinel/ui';
import { Announcement } from '@sentinel/services';
import { columns } from './columns';
import { type PaginationState } from '@tanstack/react-table';

interface AnnouncementsListProps {
    announcements: Announcement[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    pagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
    pageCount: number;
}

export function AnnouncementsList({
    announcements,
    searchTerm,
    onSearchChange,
    pagination,
    onPaginationChange,
    pageCount,
}: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
            manualPagination
        />
    );
}
