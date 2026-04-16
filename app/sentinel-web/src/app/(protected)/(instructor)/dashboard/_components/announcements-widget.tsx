'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { ArrowRight, Megaphone } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
    id: string;
    title: string;
    publishedAt?: string;
}

interface AnnouncementsWidgetProps {
    announcements: Announcement[];
}

export function AnnouncementsWidget({ announcements }: AnnouncementsWidgetProps) {
    const latestAnnouncements = announcements.slice(0, 3); // Show only top 3

    return (
        <Card className="col-span-3 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">Announcements</CardTitle>
                    <CardDescription className="text-xs">Recent updates</CardDescription>
                </div>
                <Megaphone className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {latestAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className="flex flex-col gap-1 border-b pb-2 last:border-0 last:pb-0"
                        >
                            <span className="line-clamp-1 cursor-pointer text-sm font-medium hover:underline">
                                {announcement.title}
                            </span>
                            <span className="text-muted-foreground text-xs">
                                {announcement.publishedAt}
                            </span>
                        </div>
                    ))}
                    {latestAnnouncements.length === 0 && (
                        <div className="text-muted-foreground py-4 text-center text-sm">
                            No new announcements.
                        </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link href="/announcements">
                            View All <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
