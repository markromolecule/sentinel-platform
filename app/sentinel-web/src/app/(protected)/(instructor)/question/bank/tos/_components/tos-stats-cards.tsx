'use client';

import { Card } from '@sentinel/ui';
import { BookOpen, CheckCircle2, ArchiveX, BarChart3 } from 'lucide-react';
import type { TosMatrixData } from '@sentinel/services';
import { Skeleton } from '@sentinel/ui';

export type TosStatsCardsProps = {
    data?: TosMatrixData;
    isLoading: boolean;
};

export function TosStatsCards({ data, isLoading }: TosStatsCardsProps) {
    const stats = [
        {
            label: 'Total Active',
            value: data?.activeCount ?? 0,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
            label: 'Retired',
            value: data?.retiredCount ?? 0,
            icon: ArchiveX,
            color: 'text-rose-600',
            bg: 'bg-rose-50 dark:bg-rose-950/30',
        },
        {
            label: 'Topics Tagged',
            value: data?.rows.length ?? 0,
            icon: BookOpen,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
        },
        {
            label: 'Total in Matrix',
            value: data?.grandTotal ?? 0,
            icon: BarChart3,
            color: 'text-violet-600',
            bg: 'bg-violet-50 dark:bg-violet-950/30',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {stats.map((stat) => (
                <Card key={stat.label} className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs">{stat.label}</p>
                            {isLoading ? (
                                <Skeleton className="mt-1 h-5 w-10" />
                            ) : (
                                <p className="text-xl font-bold tabular-nums">{stat.value}</p>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
