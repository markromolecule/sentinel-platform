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
                <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Calendar</p>
                </div>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0 p-0 w-full"
                />
            </div>

            <Separator />

            {/* Announcements Section */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Megaphone className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Announcements</p>
                </div>

                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 rounded-md bg-muted animate-pulse"
                            />
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No announcements yet.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {announcements.map((announcement) => (
                            <li
                                key={announcement.id}
                                className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                            >
                                <p className="text-sm leading-snug font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors">
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
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 self-start"
                >
                    View all →
                </Link>
            </div>
        </div>
    );
}
