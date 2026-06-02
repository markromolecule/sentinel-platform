'use client';

import { useState } from 'react';
import { useAnnouncementsQuery, useDebounce } from '@sentinel/hooks';
import { Skeleton } from '@sentinel/ui';
import { Tabs, TabsList, TabsTrigger } from '@sentinel/ui';
import { Announcement } from '@sentinel/services';
import { AnnouncementsList } from './announcements-list';
import { EditAnnouncementDialog } from './edit-announcement-dialog';
import { DeleteAnnouncementDialog } from './delete-announcement-dialog';

/**
 * Container component for admin/superadmin announcements management.
 * Handles server-side search, status tabs, loading state, and edit/delete dialog states.
 *
 * @returns React element representing the announcements container.
 */
export function AnnouncementsContainer() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'all' | 'draft' | 'published'>('all');
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);

    const debouncedSearch = useDebounce(search, 300);

    const { data, isLoading } = useAnnouncementsQuery({
        page: 1,
        limit: 20,
        search: debouncedSearch || undefined,
        status: status === 'all' ? undefined : status,
    });

    const handleEdit = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
    };

    const handleDelete = (announcement: Announcement) => {
        setDeletingAnnouncement(announcement);
    };

    const announcements = data?.data ?? [];

    return (
        <div className="space-y-4">
            <Tabs value={status} onValueChange={(val) => setStatus(val as any)} className="w-auto">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                </TabsList>
            </Tabs>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground text-sm font-medium">No announcements found.</p>
                    <p className="text-muted-foreground text-xs">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <AnnouncementsList
                    announcements={announcements}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchTerm={search}
                    onSearchChange={setSearch}
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
