'use client';

import { useAdminCalendar } from '@/app/(protected)/calendar/_hooks/use-admin-calendar';
import { CalendarHeader } from '@/app/(protected)/calendar/_components/calendar-header';
import { CalendarGrid } from '@/app/(protected)/calendar/_components/calendar-grid';
import { EventDialog } from '@/app/(protected)/calendar/_components/event-dialog';
import { EventDetailsSheet } from './_components/event-details-sheet';
import { useActivePermissions } from '@sentinel/hooks';
import { PageHeader, Separator, Skeleton } from '@sentinel/ui';

export default function AdminCalendarPage() {
    const { hasPermission } = useActivePermissions();
    const canAddEvent = hasPermission('calendar:create');
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
        handleToday,
        handleDayClick,
        handleAddEvent,
        handleDeleteEvent,
        getEventsForDate,
    } = useAdminCalendar();

    return (
        <div
            className="flex h-[calc(100vh-130px)] flex-col gap-4 overflow-hidden p-4 md:p-5"
            data-lenis-prevent
        >
            <PageHeader
                title="Calendar"
                description="Manage system events, announcements, and schedules."
            >
                <CalendarHeader
                    currentMonth={currentMonth}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                    onToday={handleToday}
                    onAddEvent={() => setIsAddEventOpen(true)}
                    canAddEvent={canAddEvent}
                />
            </PageHeader>
            <Separator />

            {isLoading ? (
                <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
                    <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="min-h-[100px] w-full animate-pulse rounded-lg"
                            />
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
                canAddEvent={canAddEvent}
            />

            <EventDetailsSheet
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                selectedDate={selectedDate}
                getEventsForDate={getEventsForDate}
                onAddEvent={() => setIsAddEventOpen(true)}
                onDeleteEvent={handleDeleteEvent}
                canAddEvent={canAddEvent}
            />
        </div>
    );
}
