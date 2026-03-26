"use client";

import { useAdminCalendar } from "@/app/(protected)/calendar/_hooks/use-admin-calendar";
import { CalendarHeader } from "@/app/(protected)/calendar/_components/calendar-header";
import { CalendarGrid } from "@/app/(protected)/calendar/_components/calendar-grid";
import { EventDialog } from "@/app/(protected)/calendar/_components/event-dialog";
import { EventDetailsSheet } from "./_components/event-details-sheet";
import { PageHeader } from "@sentinel/ui";

export default function AdminCalendarPage() {
    const {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        isAddEventOpen,
        calendarDays,
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
        <div className="space-y-6 h-full flex flex-col">
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

            <CalendarGrid
                currentMonth={currentMonth}
                calendarDays={calendarDays}
                getEventsForDate={getEventsForDate}
                onDayClick={handleDayClick}
            />

            <EventDialog
                open={isAddEventOpen}
                onOpenChange={setIsAddEventOpen}
                selectedDate={selectedDate || new Date()}
                onSave={handleAddEvent}
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
