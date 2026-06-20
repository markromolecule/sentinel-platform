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
                                        {dayEvents.slice(0, 3).map((event) => {
                                            const getEventStyles = (type: string) => {
                                                switch (type) {
                                                    case 'exam':
                                                        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
                                                    case 'note':
                                                        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
                                                    case 'holiday':
                                                        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
                                                    case 'announcement':
                                                        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
                                                    case 'maintenance':
                                                        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
                                                    default:
                                                        return 'bg-primary/10 text-primary border-primary/20';
                                                }
                                            };
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        'truncate rounded border px-1.5 py-0.5 text-[10px] font-medium transition-all',
                                                        getEventStyles(event.type),
                                                    )}
                                                >
                                                    {event.title}
                                                </div>
                                            );
                                        })}
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
