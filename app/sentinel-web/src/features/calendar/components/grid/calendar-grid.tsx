import { format, isToday } from 'date-fns';
import { cn } from '@sentinel/ui';
import { CalendarEvent } from '../../types';

interface CalendarGridProps {
    currentMonth: Date;
    calendarDays: Date[];
    onDayClick: (day: Date) => void;
    getEventsForDate: (date: Date) => CalendarEvent[];
}

export function CalendarGrid({
    currentMonth,
    calendarDays,
    onDayClick,
    getEventsForDate,
}: CalendarGridProps) {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
            <div className="flex flex-1 flex-col overflow-x-auto">
                <div className="flex min-w-[800px] flex-1 flex-col">
                    {/* Days Header */}
                    <div className="border-border bg-muted/40 grid grid-cols-7 border-b">
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-muted-foreground py-3 text-center text-sm font-medium"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="bg-background grid flex-1 auto-rows-fr grid-cols-7">
                        {calendarDays.map((day) => {
                            const dayEvents = getEventsForDate(day);
                            const isCurrentMonth = format(day, 'M') === format(currentMonth, 'M');

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => onDayClick(day)}
                                    className={cn(
                                        'border-border/50 hover:bg-muted/30 group relative min-h-[100px] cursor-pointer border-r border-b p-2 transition-colors',
                                        !isCurrentMonth && 'bg-muted/10 text-muted-foreground',
                                        isToday(day) && 'bg-primary/5',
                                    )}
                                >
                                    <div className="mb-1 flex items-start justify-between">
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                                                isToday(day)
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                className="bg-primary/10 text-primary border-primary/20 truncate rounded border px-1.5 py-0.5 text-[10px] font-medium"
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="text-muted-foreground pl-1 text-[10px]">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
