'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sentinel/ui';
import { Badge } from '@sentinel/ui';
import { MOCK_PLATFORM_ACTIVITY } from '@sentinel/shared/constants';
import Link from 'next/link';

/**
 * Renders a card displaying the latest cross-institution platform activities.
 * Shows up to 6 activities with status badges and links to full logs.
 */
export function SystemActivityWidget() {
    const activities = MOCK_PLATFORM_ACTIVITY.slice(0, 6);

    const getBadgeVariant = (type: (typeof MOCK_PLATFORM_ACTIVITY)[number]['type']) => {
        switch (type) {
            case 'success':
                return 'default';
            case 'warning':
                return 'secondary';
            case 'error':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Platform Activity</CardTitle>
                    <CardDescription>
                        Latest actions and alerts across all institutions on the platform.
                    </CardDescription>
                </div>
                <Link
                    href="/logs"
                    className="text-primary text-sm font-medium transition-colors hover:underline"
                >
                    View All →
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-center">
                                <Badge
                                    className="mr-3 flex h-8 w-8 items-center justify-center rounded-full p-0 font-bold"
                                    variant={getBadgeVariant(activity.type)}
                                >
                                    {activity.type[0].toUpperCase()}
                                </Badge>
                                <div className="space-y-1">
                                    <p className="text-sm leading-none font-medium">
                                        <span className="text-foreground font-semibold">
                                            {activity.actor}
                                        </span>{' '}
                                        {activity.action}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {activity.timestamp}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-muted/30 text-xs">
                                {activity.institutionName}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
