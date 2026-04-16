'use client';

import { cn } from '@sentinel/ui';
import { format, isToday } from 'date-fns';
import { AdminEvent } from '@sentinel/shared/types';

interface DayCellProps {
    day: Date;
    currentMonth: Date;
    events: AdminEvent[];
    onClick: (day: Date) => void;
}

export function DayCell({ day, currentMonth, events, onClick }: DayCellProps) {
    const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');
    const isTodayDate = isToday(day);

    return (
        <div
            onClick={() => onClick(day)}
            className={cn(
                'border-border/50 hover:bg-muted/30 group relative min-h-[100px] cursor-pointer border-r border-b p-2 transition-colors',
                !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                isTodayDate && 'bg-primary/5',
            )}
        >
            <div className="mb-1 flex items-start justify-between">
                <span
                    className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                        isTodayDate
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground',
                    )}
                >
                    {format(day, 'd')}
                </span>
            </div>

            <div className="space-y-1">
                {events.slice(0, 3).map((event) => (
                    <div
                        key={event.id}
                        className={cn(
                            'truncate rounded border px-1.5 py-0.5 text-[10px] font-medium',
                            event.type === 'maintenance' &&
                                'bg-destructive/10 text-destructive border-destructive/20',
                            event.type === 'announcement' &&
                                'border-amber-500/20 bg-amber-500/10 text-amber-600',
                            event.type === 'event' &&
                                'bg-primary/10 text-primary border-primary/20',
                        )}
                    >
                        {event.title}
                    </div>
                ))}
                {events.length > 3 && (
                    <div className="text-muted-foreground pl-1 text-[10px]">
                        +{events.length - 3} more
                    </div>
                )}
            </div>
        </div>
    );
}
