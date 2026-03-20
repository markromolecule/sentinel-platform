import { useState } from 'react';
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
import { MOCK_PROCTOR_EXAMS } from '@sentinel/shared/constants';
import { CalendarEvent } from '@/app/(protected)/(proctor)/calendar/_types';

// Helper to convert exam to calendar event format
const getCalendarEvents = (): CalendarEvent[] => {
    return MOCK_PROCTOR_EXAMS.filter((exam) => exam.scheduledDate).map((exam) => ({
        id: exam.id,
        title: exam.title,
        date: new Date(exam.scheduledDate!),
        type: 'exam',
        description: exam.description,
        duration: exam.duration,
        studentsCount: exam.studentsCount ?? 0,
    }));
};

export function useCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const events = getCalendarEvents();

    // Calendar Logic
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
