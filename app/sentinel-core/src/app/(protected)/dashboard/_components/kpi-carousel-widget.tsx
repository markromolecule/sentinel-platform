'use client';

import { SupportKpiCard } from '@sentinel/shared/types';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@sentinel/ui';

interface KpiCarouselWidgetProps {
    cards: SupportKpiCard[];
}

/**
 * Renders the dashboard metrics in a responsive grid rather than a carousel,
 * matching the Overview section style of the reference design.
 *
 * @param props.cards The list of KPI cards to display.
 */
export function KpiCarouselWidget({ cards = [] }: KpiCarouselWidgetProps) {
    if (!cards || cards.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                Overview
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const formattedTrendValue =
                        card.change !== undefined
                            ? `${card.change > 0 ? '+' : ''}${card.change}%`
                            : undefined;

                    return (
                        <div
                            key={card.id}
                            className="bg-blue-50/50 dark:bg-slate-900/40 border border-blue-100/30 dark:border-blue-900/10 rounded-2xl p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-sm"
                        >
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {card.label}
                            </span>
                            
                            <div className="flex flex-col mt-2">
                                <span className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">
                                    {card.value}
                                </span>
                                
                                {(card.description || card.trend) && (
                                    <div className="text-slate-500/80 dark:text-slate-400/80 flex items-center pt-1.5 text-xs font-medium">
                                        {card.trend && (
                                            <span
                                                className={cn(
                                                    'mr-1.5 flex items-center font-semibold',
                                                    card.trend === 'up' && 'text-green-600 dark:text-green-500',
                                                    card.trend === 'down' && 'text-red-600 dark:text-red-500',
                                                    card.trend === 'neutral' && 'text-muted-foreground',
                                                )}
                                            >
                                                {card.trend === 'up' && <ArrowUp className="mr-0.5 h-3.5 w-3.5" />}
                                                {card.trend === 'down' && <ArrowDown className="mr-0.5 h-3.5 w-3.5" />}
                                                {card.trend === 'neutral' && <Minus className="mr-0.5 h-3.5 w-3.5" />}
                                                {formattedTrendValue}
                                            </span>
                                        )}
                                        {card.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
