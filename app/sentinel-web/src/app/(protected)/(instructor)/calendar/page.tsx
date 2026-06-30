'use client';

import { PageHeader, Separator } from '@sentinel/ui';
import { useCalendar, CalendarHeader, CalendarGrid, DayDetailsSheet } from '@/features/calendar';
import { useCalendarEventsQuery } from '@sentinel/hooks';
import { Skeleton } from '@sentinel/ui';
import { useMemo } from 'react';

export default function ProctorCalendarPage() {
    // Initial call to useCalendar to manage UI and currentMonth state
    const {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        setIsDetailsOpen,
        calendarDays,
        handlePreviousMonth,
        handleNextMonth,
        handleToday,
        handleDayClick,
    } = useCalendar({ events: [] });

    // Dynamic month/year mapping for active queries
    const payload = useMemo(() => {
        return {
            month: currentMonth.getMonth() + 1,
            year: currentMonth.getFullYear(),
        };
    }, [currentMonth]);

    // Query real calendar events from the API
    const { data, isLoading } = useCalendarEventsQuery({
        payload,
    });

    // Map CalendarEventResponse[] to CalendarEvent[]
    const mappedEvents = useMemo(() => {
        if (!data) return [];
        return data.map((event) => ({
            id: event.eventId,
            title: event.title,
            date: new Date(event.startDate),
            type: event.eventType === 'NOTE' ? 'note' : event.eventType.toLowerCase(),
            description: event.description || '',
            startTime: event.startTime || undefined,
            endTime: event.endTime || undefined,
            createdBy: event.createdBy || '',
            createdByName: event.createdByName || '',
        }));
    }, [data]);

    // Re-initialize dynamic getEventsForDate on the fly
    const getEventsForDate = useMemo(() => {
        return (date: Date) => {
            return mappedEvents.filter(
                (event) =>
                    event.date.getDate() === date.getDate() &&
                    event.date.getMonth() === date.getMonth() &&
                    event.date.getFullYear() === date.getFullYear(),
            );
        };
    }, [mappedEvents]);

    return (
        <div
            className="flex h-[calc(100vh-130px)] flex-col gap-4 overflow-hidden p-4 md:p-5"
            data-lenis-prevent
        >
            <PageHeader
                title="Calendar"
                description="View institution events, announcements, and schedules."
            >
                <CalendarHeader
                    currentMonth={currentMonth}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                    onToday={handleToday}
                />
            </PageHeader>
            <Separator />

            {isLoading ? (
                <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
                    <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="min-h-[100px] w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {mappedEvents.length === 0 && !isLoading && (
                        <div className="animate-fadeIn mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-medium text-amber-600">
                            No scheduled exams or events found for this month.
                        </div>
                    )}

                    <CalendarGrid
                        currentMonth={currentMonth}
                        calendarDays={calendarDays}
                        onDayClick={handleDayClick}
                        getEventsForDate={getEventsForDate}
                    />
                </>
            )}

            <DayDetailsSheet
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                selectedDate={selectedDate}
                getEventsForDate={getEventsForDate}
            />
        </div>
    );
}
