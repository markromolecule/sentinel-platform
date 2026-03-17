"use client";

import { useCalendar } from "@/app/(protected)/(proctor)/calendar/_hooks/use-calendar";
import { PageHeader } from "@/components/common/page-header";
import { CalendarHeader } from "@/app/(protected)/(proctor)/calendar/_components/calendar-header";
import { CalendarGrid } from "@/app/(protected)/(proctor)/calendar/_components/calendar-grid";
import { DayDetailsSheet } from "@/app/(protected)/(proctor)/calendar/_components/day-details-sheet";

export default function ProctorCalendarPage() {
    const {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        setIsDetailsOpen,
        calendarDays,
        handlePreviousMonth,
        handleNextMonth,
        handleDayClick,
        getEventsForDate,
    } = useCalendar();

    return (
        <div className="space-y-6 h-full flex flex-col">
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

            <CalendarGrid
                currentMonth={currentMonth}
                calendarDays={calendarDays}
                onDayClick={handleDayClick}
                getEventsForDate={getEventsForDate}
            />

            <DayDetailsSheet
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                selectedDate={selectedDate}
                getEventsForDate={getEventsForDate}
            />
        </div>
    );
}

