'use client';

import { useState } from 'react';
import { useAnnouncementsQuery, useDebounce, useServerPagination } from '@sentinel/hooks';
import { Skeleton } from '@sentinel/ui';
import { Announcement } from '@sentinel/services';
import { ColumnFiltersState } from '@tanstack/react-table';
import { AnnouncementsList } from './announcements-list';
import { EditAnnouncementDialog } from './edit-announcement-dialog';
import { DeleteAnnouncementDialog } from './delete-announcement-dialog';

/**
 * Container component for admin/superadmin announcements management.
 * Handles server-side search, status facets, loading state, and edit/delete dialog states.
 *
 * @returns React element representing the announcements container.
 */
export function AnnouncementsContainer() {
    const [search, setSearch] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

    const debouncedSearch = useDebounce(search, 300);

    const statusFilter = columnFilters.find((f) => f.id === 'status');
    const selectedStatuses = statusFilter?.value as string[] | undefined;
    const status =
        selectedStatuses && selectedStatuses.length > 0
            ? (selectedStatuses[0] as 'draft' | 'published' | 'unpublished')
            : undefined;

    const { pagination, setPagination } = useServerPagination([debouncedSearch, status]);

    const { data, isLoading } = useAnnouncementsQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        status,
    });

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
    };

    const handleDelete = (announcement: Announcement) => {
        setDeletingAnnouncement(announcement);
    };

    const announcements = data?.data ?? [];
    const pageCount = data?.meta?.totalPages ?? 1;

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : announcements.length === 0 && search === '' && !status ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm font-medium">
                        No announcements found.
                    </p>
                    <p className="text-muted-foreground text-xs">
                        Try adjusting your filters or search terms.
                    </p>
                </div>
            ) : (
                <AnnouncementsList
                    announcements={announcements}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchTerm={search}
                    onSearchChange={setSearch}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    pageCount={pageCount}
                />
            )}

            <EditAnnouncementDialog
                announcement={editingAnnouncement}
                open={editingAnnouncement !== null}
                onOpenChange={(open) => !open && setEditingAnnouncement(null)}
            />

            <DeleteAnnouncementDialog
                announcementId={deletingAnnouncement?.id ?? ''}
                announcementTitle={deletingAnnouncement?.title ?? ''}
                open={deletingAnnouncement !== null}
                onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
            />
        </div>
    );
}
