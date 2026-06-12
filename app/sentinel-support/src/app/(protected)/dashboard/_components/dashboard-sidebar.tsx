'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Megaphone } from 'lucide-react';
import { Calendar, Separator } from '@sentinel/ui';
import { useAnnouncementsQuery } from '@sentinel/hooks';

/**
 * DashboardSidebar renders the persistent right-hand sidebar for the support dashboard.
 * It contains:
 * - A shadcn Calendar widget for at-a-glance date reference.
 * - A trimmed announcements feed showing the latest 3 published announcements,
 *   with a "View all" link to the full announcements page.
 */
export function DashboardSidebar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Fetch the latest published announcements — only 3 needed for the sidebar
    const { data: announcementsResponse, isLoading } = useAnnouncementsQuery({
        limit: 3,
        sortBy: 'published_at',
        sortOrder: 'desc',
        status: 'published',
    });

    const announcements = announcementsResponse?.data ?? [];

    return (
        <div className="flex flex-col gap-0">
            {/* Calendar Section */}
            <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground size-4" />
                    <p className="text-sm font-medium">Calendar</p>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full rounded-md border-0 p-0"
                />
            </div>

            <Separator />

            {/* Announcements Section */}
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2">
                    <Megaphone className="text-muted-foreground size-4" />
                    <p className="text-sm font-medium">Announcements</p>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-muted h-10 animate-pulse rounded-md" />
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <p className="text-muted-foreground text-xs">No announcements yet.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {announcements.map((announcement) => (
                            <li
                                key={announcement.id}
                                className="group flex cursor-pointer flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 shadow-2xs transition-all hover:bg-slate-100/50 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"
                            >
                                <p className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold text-slate-800 transition-colors dark:text-slate-200">
                                    {announcement.title}
                                </p>
                                {announcement.published_at && (
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        {new Intl.DateTimeFormat('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        }).format(new Date(announcement.published_at))}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <Link
                    href="/announcements"
                    className="text-muted-foreground hover:text-foreground mt-1 self-start text-xs transition-colors"
                >
                    View all →
                </Link>
            </div>
        </div>
    );
}
