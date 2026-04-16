'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sentinel/ui';
import { Activity } from '@sentinel/shared/types';
import { Badge } from '@sentinel/ui';

interface SystemHealthProps {
    recentActivity: Activity[];
}

export function SystemHealth({ recentActivity }: SystemHealthProps) {
    const getBadgeVariant = (type: Activity['type']) => {
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
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Global System Activity</CardTitle>
                    <CardDescription>
                        Latest actions and alerts across all institutions on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center">
                                <Badge
                                    className="mr-3 flex h-8 w-8 items-center justify-center rounded-full p-0"
                                    variant={getBadgeVariant(activity.type)}
                                >
                                    {activity.type[0].toUpperCase()}
                                </Badge>
                                <div className="space-y-1">
                                    <p className="text-sm leading-none font-medium">
                                        {activity.user} {activity.action}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {activity.target} • {activity.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
