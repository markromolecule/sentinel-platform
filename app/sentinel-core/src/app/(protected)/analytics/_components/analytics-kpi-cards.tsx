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
};

/**
 * Renders key performance indicator (KPI) cards with clean micro-trend badges
 * and smooth glassmorphism scale-up hover animations.
 *
 * @param props - Component properties containing KPI data array
 */
export function AnalyticsKPICards({ data }: AnalyticsKPICardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((card: AnalyticsKPICardData) => {
                const Icon = ICON_MAP[card.id] || Activity;

                return (
                    <Card
                        key={card.id}
                        className={cn(
                            'relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                            'border-border/50 bg-card/65 backdrop-blur-md',
                        )}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <span className="text-muted-foreground text-sm font-medium">
                                {card.label}
                            </span>
                            <div className="bg-primary/10 text-primary rounded-lg p-2">
                                <Icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">{card.value}</div>
                            {card.change !== undefined && (
                                <div className="mt-2 flex items-center space-x-1.5 text-xs">
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
                                            <ArrowUpRight className="mr-0.5 h-3.5 w-3.5 shrink-0" />
                                        ) : card.trend === 'down' ? (
                                            <ArrowDownRight className="mr-0.5 h-3.5 w-3.5 shrink-0" />
                                        ) : null}
                                        {Math.abs(card.change)}%
                                    </span>
                                    {card.description && (
                                        <span className="text-muted-foreground">
                                            {card.description}
                                        </span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
