'use client';

import { DataTable, type DataTableFacet } from '@sentinel/ui';
import { columns } from './columns';
import { Announcement } from '@sentinel/services';
import { ColumnFiltersState } from '@tanstack/react-table';

const announcementsFacets = [
    {
        columnKey: 'status',
        title: 'Status',
        options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Unpublished', value: 'unpublished' },
        ],
    },
] satisfies DataTableFacet[];

interface AnnouncementsListProps {
    announcements: Announcement[];
    onEdit?: (announcement: Announcement) => void;
    onDelete?: (announcement: Announcement) => void;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
}

export function AnnouncementsList({
    announcements,
    onEdit,
    onDelete,
    searchTerm,
    onSearchChange,
    columnFilters,
    onColumnFiltersChange,
}: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            facets={announcementsFacets}
            meta={{ onEdit, onDelete }}
        />
    );
}
