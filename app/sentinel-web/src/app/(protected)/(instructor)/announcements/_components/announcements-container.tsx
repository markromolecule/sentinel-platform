'use client';

import { useState } from 'react';
import { useAnnouncementsQuery, useDebounce, useServerPagination } from '@sentinel/hooks';
import { Skeleton } from '@sentinel/ui';
import { AnnouncementsList } from './announcements-list';

/**
 * Container component that fetches announcements and handles loading/empty states with server pagination.
 *
 * @returns React element representing the announcements container.
 */
export function AnnouncementsContainer() {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);

    const { pagination, setPagination } = useServerPagination([debouncedSearch], {
        pageIndex: 0,
        pageSize: 20,
    });

    const { data, isLoading } = useAnnouncementsQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    const announcements = data?.data ?? [];
    const pageCount = data?.meta?.totalPages ?? 1;

    if (announcements.length === 0 && search === '') {
        return (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground text-sm font-medium">No announcements yet.</p>
                <p className="text-muted-foreground text-xs">Stay tuned for future updates.</p>
            </div>
        );
    }

    return (
        <AnnouncementsList
            announcements={announcements}
            searchTerm={search}
            onSearchChange={setSearch}
            pagination={pagination}
            onPaginationChange={setPagination}
            pageCount={pageCount}
        />
    );
}
