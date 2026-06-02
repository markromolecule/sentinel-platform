'use client';

import { useAnnouncementsQuery } from '@sentinel/hooks';
import { Skeleton } from '@sentinel/ui';
import { AnnouncementsList } from './announcements-list';

/**
 * Container component that fetches announcements and handles loading/empty states.
 *
 * @returns React element representing the announcements container.
 */
export function AnnouncementsContainer() {
    const { data, isLoading } = useAnnouncementsQuery();

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

    if (announcements.length === 0) {
        return (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground text-sm font-medium">No announcements yet.</p>
                <p className="text-muted-foreground text-xs">Stay tuned for future updates.</p>
            </div>
        );
    }

    return <AnnouncementsList announcements={announcements} />;
}
