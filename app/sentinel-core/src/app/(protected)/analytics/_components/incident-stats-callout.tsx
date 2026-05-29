'use client';

import * as React from 'react';
import { Card, CardContent } from '@sentinel/ui';
import { cn } from '@sentinel/ui';

export interface IncidentStatsCalloutProps {
    /** Short label displayed above the value */
    label: string;
    /** Primary metric value */
    value: string | number;
    /** Supporting description shown below the value */
    description: string;
    /** Lucide icon component */
    icon: React.ComponentType<{ className?: string }>;
    /** Tailwind classes for the icon wrapper (background + text + border) */
    colorClass: string;
}

/**
 * IncidentStatsCallout renders a compact stat card used across analytics tabs
 * to surface a single key metric with an icon, value, and description.
 *
 * @param props - Component properties
 */
export function IncidentStatsCallout({
    label,
    value,
    description,
    icon: Icon,
    colorClass,
}: IncidentStatsCalloutProps) {
    return (
        <Card className="bg-card/45 border-border/60 shadow-sm py-0 gap-0">
            <CardContent className="flex items-center gap-3.5 p-4">
                <div className={cn('shrink-0 rounded-lg border p-2', colorClass)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider leading-none">
                        {label}
                    </h4>
                    <p className="text-foreground text-xl font-bold tracking-tight truncate leading-tight">
                        {value}
                    </p>
                    <p className="text-muted-foreground text-xs leading-normal truncate">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
