import { useState } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameDay,
} from 'date-fns';
import { AdminEvent } from '@sentinel/shared/types';
import { MOCK_ADMIN_EVENTS } from '@sentinel/shared/constants';

export function useAdminCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [events, setEvents] = useState<AdminEvent[]>(MOCK_ADMIN_EVENTS);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsDetailsOpen(true);
    };

    const handleAddEvent = (newEventData: Omit<AdminEvent, 'id' | 'createdBy'>) => {
        const newEvent: AdminEvent = {
            ...newEventData,
            id: Math.random().toString(36).substr(2, 9),
            createdBy: 'admin-1',
        };
        setEvents([...events, newEvent]);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(events.filter((ev) => ev.id !== id));
    };

    const getEventsForDate = (date: Date) => {
        return events.filter((event) => isSameDay(event.date, date));
    };

    return {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        isAddEventOpen,
        events,
        calendarDays,
        setCurrentMonth,
        setIsDetailsOpen,
        setIsAddEventOpen,
        handlePreviousMonth,
        handleNextMonth,
        handleDayClick,
        handleAddEvent,
        handleDeleteEvent,
        getEventsForDate,
    };
}
