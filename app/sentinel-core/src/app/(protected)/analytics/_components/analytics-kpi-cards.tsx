'use client';

import * as React from 'react';
import { Card, cn } from '@sentinel/ui';
import { Activity, Clock, FileText, Shield, ShieldAlert } from 'lucide-react';
import { AnalyticsKPICardsProps, AnalyticsKPICardData } from '@sentinel/shared/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    'kpi-1': FileText,
    'kpi-2': Activity,
    'kpi-3': ShieldAlert,
    'kpi-4': Clock,
    'kpi-5': Shield,
};

/**
 * Renders the analytics KPI cards with restrained spacing and low-noise trend badges.
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
                            'flex min-h-[124px] flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm',
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                {card.label}
                            </span>
                            <div className="bg-muted/50 text-muted-foreground shrink-0 rounded-lg border border-border/60 p-2">
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-2xl leading-none font-semibold tracking-tight">
                                {card.value}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {card.change !== undefined && (
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium leading-none',
                                            card.trend === 'up'
                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                : card.trend === 'down'
                                                  ? 'bg-rose-500/10 text-rose-600'
                                                  : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {card.change > 0 ? '+' : ''}
                                        {Math.abs(card.change)}%
                                    </span>
                                )}

                                {card.description && (
                                    <span className="text-muted-foreground min-w-0 truncate text-sm">
                                        {card.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
