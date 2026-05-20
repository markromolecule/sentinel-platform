import { useState, useMemo } from 'react';
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
import { AdminEvent, TargetAudience } from '@sentinel/shared/types';
import { useCalendarEventsQuery } from '@/hooks/query/calendar/use-calendar-events-query';
import { useCreateCalendarEventMutation } from '@/hooks/mutations/calendar/use-create-calendar-event-mutation';
import { useDeleteCalendarEventMutation } from '@/hooks/mutations/calendar/use-delete-calendar-event-mutation';

export function useAdminCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);

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

    // Dynamic month/year payload for react-query
    const queryPayload = useMemo(() => {
        return {
            month: currentMonth.getMonth() + 1,
            year: currentMonth.getFullYear(),
        };
    }, [currentMonth]);

    // Hook up TanStack Queries
    const { data: rawEvents, isLoading } = useCalendarEventsQuery({
        payload: queryPayload,
    });

    // Hook up TanStack Mutations
    const { mutate: createEvent, isPending: isCreating, error: createError } = useCreateCalendarEventMutation({
        onSuccess: () => {
            setIsAddEventOpen(false);
        },
    });

    const { mutate: deleteEvent } = useDeleteCalendarEventMutation();

    // Map CalendarEventResponse[] to AdminEvent[]
    const events = useMemo(() => {
        if (!rawEvents) return [];
        return rawEvents.map((event) => ({
            id: event.eventId,
            title: event.title,
            date: new Date(event.startDate),
            type:
                event.eventType === 'NOTE'
                    ? 'event'
                    : (event.eventType.toLowerCase() as AdminEvent['type']),
            description: event.description || '',
            targetAudience:
                event.targetAudience === 'ALL'
                    ? 'all'
                    : event.targetAudience === 'INSTRUCTORS'
                      ? 'proctors'
                      : (event.targetAudience.toLowerCase() as TargetAudience),
            startTime: event.startTime || undefined,
            endTime: event.endTime || undefined,
            createdBy: event.createdBy || '',
        }));
    }, [rawEvents]);

    const handleAddEvent = (newEventData: Omit<AdminEvent, 'id' | 'createdBy'>) => {
        createEvent({
            title: newEventData.title,
            description: newEventData.description || undefined,
            eventType:
                newEventData.type === 'event'
                    ? 'EVENT'
                    : newEventData.type === 'announcement'
                      ? 'ANNOUNCEMENT'
                      : 'MAINTENANCE',
            targetAudience:
                newEventData.targetAudience === 'all'
                    ? 'ALL'
                    : newEventData.targetAudience === 'students'
                      ? 'STUDENTS'
                      : newEventData.targetAudience === 'proctors'
                        ? 'INSTRUCTORS'
                        : 'SPECIFIC_GROUP',
            startDate: newEventData.date.toISOString(),
            startTime: newEventData.startTime || undefined,
            endTime: newEventData.endTime || undefined,
        });
    };

    const handleDeleteEvent = (id: string) => {
        deleteEvent({ eventId: id });
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
        isLoading,
        isCreating,
        createError,
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
