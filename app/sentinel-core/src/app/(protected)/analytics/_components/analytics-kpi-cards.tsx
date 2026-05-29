'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@sentinel/ui';
import {
    Shield,
    Activity,
    ShieldAlert,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
} from 'lucide-react';
import { AnalyticsKPICardsProps, AnalyticsKPICardData } from '@sentinel/shared/types';
import { cn } from '@sentinel/ui';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    'kpi-1': FileText,
    'kpi-2': Activity,
    'kpi-3': ShieldAlert,
    'kpi-4': Clock,
    'kpi-5': Shield,
};

/**
 * Renders key performance indicator (KPI) cards with clean micro-trend badges
 * and smooth glassmorphism scale-up hover animations.
 *
 * @param props - Component properties containing KPI data array
 */
export function AnalyticsKPICards({ data }: AnalyticsKPICardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.map((card: AnalyticsKPICardData) => {
                const Icon = ICON_MAP[card.id] || Activity;

                return (
                    <Card
                        key={card.id}
                        className={cn(
                            'relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                            'border-border/50 bg-card/65 backdrop-blur-md p-4 flex flex-col gap-2 py-3.5 px-4',
                        )}
                    >
                        <div className="flex flex-row items-center justify-between space-y-0">
                            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                {card.label}
                            </span>
                            <div className="bg-primary/10 text-primary rounded-lg p-1.5 shrink-0">
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl font-bold tracking-tight leading-none">{card.value}</div>
                            {card.change !== undefined && (
                                <div className="flex items-center space-x-1.5 text-[10px]">
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-1.5 py-0.5 leading-none font-medium',
                                            card.trend === 'up'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : card.trend === 'down'
                                                  ? 'bg-rose-500/10 text-rose-500'
                                                  : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {card.trend === 'up' ? (
                                            <ArrowUpRight
                                                className="mr-0.5 h-3 w-3 shrink-0"
                                                aria-label="Trending up"
                                            />
                                        ) : card.trend === 'down' ? (
                                            <ArrowDownRight
                                                className="mr-0.5 h-3 w-3 shrink-0"
                                                aria-label="Trending down"
                                            />
                                        ) : null}
                                        {Math.abs(card.change)}%
                                    </span>
                                    {card.description && (
                                        <span className="text-muted-foreground truncate">
                                            {card.description}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
