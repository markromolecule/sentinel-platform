'use client';

import { AdminEvent } from '@sentinel/shared/types';
import { DayCell } from './day-cell';

interface CalendarGridProps {
    currentMonth: Date;
    calendarDays: Date[];
    getEventsForDate: (date: Date) => AdminEvent[];
    onDayClick: (day: Date) => void;
}

export function CalendarGrid({
    currentMonth,
    calendarDays,
    getEventsForDate,
    onDayClick,
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
                        {calendarDays.map((day) => (
                            <DayCell
                                key={day.toString()}
                                day={day}
                                currentMonth={currentMonth}
                                events={getEventsForDate(day)}
                                onClick={onDayClick}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
