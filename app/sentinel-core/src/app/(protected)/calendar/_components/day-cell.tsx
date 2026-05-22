'use client';

import { Badge, cn } from '@sentinel/ui';
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
                'border-border/60 hover:bg-muted/40 group relative min-h-[132px] cursor-pointer border-r border-b p-3 transition-colors',
                !isCurrentMonth && 'bg-muted/15 text-muted-foreground',
                isTodayDate && 'bg-primary/5',
            )}
        >
            <div className="mb-3 flex items-start justify-between gap-2">
                <span
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                        isTodayDate
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground',
                    )}
                >
                    {format(day, 'd')}
                </span>
                {events.length > 0 && (
                    <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
                        {events.length}
                    </Badge>
                )}
            </div>

            <div className="space-y-1.5">
                {events.slice(0, 3).map((event) => (
                    <div
                        key={event.id}
                        className={cn(
                            'rounded-md border px-2 py-1 text-[10px] font-medium leading-tight shadow-[0_1px_0_rgba(15,23,42,0.03)]',
                            event.type === 'maintenance' &&
                                'bg-destructive/10 text-destructive border-destructive/20',
                            event.type === 'announcement' &&
                                'border-amber-500/20 bg-amber-500/10 text-amber-600',
                            event.type === 'event' &&
                                'bg-primary/10 text-primary border-primary/20',
                        )}
                    >
                        <p className="truncate">{event.title}</p>
                        {(event.startTime || event.endTime) && (
                            <p className="mt-0.5 text-[9px] opacity-75">
                                {event.startTime || '--:--'}
                                {event.endTime ? ` - ${event.endTime}` : ''}
                            </p>
                        )}
                    </div>
                ))}
                {events.length > 3 && (
                    <div className="text-muted-foreground pl-1 text-[10px] font-medium">
                        +{events.length - 3} more
                    </div>
                )}
            </div>
        </div>
    );
}
