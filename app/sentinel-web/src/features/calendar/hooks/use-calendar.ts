import { useState, useMemo } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import { CalendarEvent } from '../types';

interface UseCalendarOptions {
    events: CalendarEvent[];
}

export function useCalendar({ events }: UseCalendarOptions) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Calendar Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = useMemo(
        () =>
            eachDayOfInterval({
                start: startDate,
                end: endDate,
            }),
        [startDate, endDate],
    );

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsDetailsOpen(true);
    };

    const getEventsForDate = (date: Date) => {
        return events.filter((event) => isSameDay(event.date, date));
    };

    return {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        setIsDetailsOpen,
        calendarDays,
        handlePreviousMonth,
        handleNextMonth,
        handleDayClick,
        getEventsForDate,
    };
}
