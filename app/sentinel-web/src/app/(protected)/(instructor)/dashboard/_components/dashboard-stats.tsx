'use client';

import Link from 'next/link';
import { Card } from '@sentinel/ui';
import { DashboardStatsProps } from '@sentinel/shared/types';

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Link key={stat.label} href={stat.href}>
                    <Card className="border-border/50 cursor-pointer p-6 transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">{stat.label}</p>
                                <p className="text-foreground text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
