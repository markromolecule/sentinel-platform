'use client';

import { useAdminCalendar } from '@/app/(protected)/calendar/_hooks/use-admin-calendar';
import { CalendarHeader } from '@/app/(protected)/calendar/_components/calendar-header';
import { CalendarGrid } from '@/app/(protected)/calendar/_components/calendar-grid';
import { EventDialog } from '@/app/(protected)/calendar/_components/event-dialog';
import { EventDetailsSheet } from './_components/event-details-sheet';
import { PageHeader, Skeleton } from '@sentinel/ui';

export default function AdminCalendarPage() {
    const {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        isAddEventOpen,
        calendarDays,
        isLoading,
        isCreating,
        createError,
        setIsDetailsOpen,
        setIsAddEventOpen,
        handlePreviousMonth,
        handleNextMonth,
        handleDayClick,
        handleAddEvent,
        handleDeleteEvent,
        getEventsForDate,
    } = useAdminCalendar();

    return (
        <div className="flex h-full flex-col space-y-6">
            <PageHeader
                title="Calendar"
                description="Manage system events, announcements, and schedules."
                className="px-0"
            >
                <CalendarHeader
                    currentMonth={currentMonth}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                    onAddEvent={() => setIsAddEventOpen(true)}
                />
            </PageHeader>

            {isLoading ? (
                <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
                    <div className="grid flex-1 grid-cols-7 gap-2 auto-rows-fr">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="min-h-[100px] w-full rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            ) : (
                <CalendarGrid
                    currentMonth={currentMonth}
                    calendarDays={calendarDays}
                    getEventsForDate={getEventsForDate}
                    onDayClick={handleDayClick}
                />
            )}

            <EventDialog
                open={isAddEventOpen}
                onOpenChange={setIsAddEventOpen}
                selectedDate={selectedDate || new Date()}
                onSave={handleAddEvent}
                disabled={isCreating}
                error={createError}
            />

            <EventDetailsSheet
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                selectedDate={selectedDate}
                getEventsForDate={getEventsForDate}
                onAddEvent={() => setIsAddEventOpen(true)}
                onDeleteEvent={handleDeleteEvent}
            />
        </div>
    );
}
