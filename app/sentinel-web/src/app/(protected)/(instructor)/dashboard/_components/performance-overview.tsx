'use client';

import { Card } from '@sentinel/ui';
import { TrendingUp, Clock } from 'lucide-react';

export function PerformanceOverview() {
    return (
        <Card className="border-border/50 p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">Performance Overview</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-50 p-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-muted-foreground text-sm">Average Pass Rate</span>
                    </div>
                    <span className="text-foreground text-lg font-semibold">78.5%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-muted-foreground text-sm">Avg. Completion Time</span>
                    </div>
                    <span className="text-foreground text-lg font-semibold">45 min</span>
                </div>
            </div>
        </Card>
    );
}
