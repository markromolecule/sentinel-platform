'use client';

import { Users } from 'lucide-react';
import { MonitoringStatsProps } from '@sentinel/shared/types';

export function MonitoringStats({ stats }: MonitoringStatsProps) {
    return (
        <div className="bg-muted/50 border-border/50 flex items-center gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">Total:</span>
                <span className="text-foreground font-semibold">{stats.total}</span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground text-sm">Active:</span>
                <span className="text-foreground font-semibold">{stats.active}</span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground text-sm">Flagged:</span>
                <span className="text-foreground font-semibold">{stats.flagged}</span>
            </div>
            <div className="bg-border h-4 w-px" />
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground text-sm">Submitted:</span>
                <span className="text-foreground font-semibold">{stats.submitted}</span>
            </div>
        </div>
    );
}
