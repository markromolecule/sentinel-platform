'use client';

import { PageHeader } from '@sentinel/ui';
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
            createdBy: event.createdBy,
            createdByName: event.createdByName,
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
        <div className="flex h-full flex-col space-y-6">
            <PageHeader
                title="Calendar"
                description="View your scheduled examinations."
                className="px-0"
            >
                <CalendarHeader
                    currentMonth={currentMonth}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                />
            </PageHeader>

            {isLoading ? (
                <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
                    <div className="grid flex-1 grid-cols-7 gap-2 auto-rows-fr">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="min-h-[100px] w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {mappedEvents.length === 0 && !isLoading && (
                        <div className="bg-amber-500/10 border-amber-500/20 text-amber-600 mb-4 rounded-xl border p-4 text-sm font-medium animate-fadeIn">
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
