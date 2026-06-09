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
        <Card className="bg-card/45 border-border/60 gap-0 py-0 shadow-sm">
            <CardContent className="flex items-center gap-3.5 p-4">
                <div className={cn('shrink-0 rounded-lg border p-2', colorClass)}>
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-muted-foreground text-[10px] leading-none font-semibold tracking-wider uppercase">
                        {label}
                    </h4>
                    <p className="text-foreground truncate text-xl leading-tight font-bold tracking-tight">
                        {value}
                    </p>
                    <p className="text-muted-foreground truncate text-xs leading-normal">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
