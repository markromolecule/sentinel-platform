"use client";

import { PageHeader } from "@sentinel/ui";
import { 
    useCalendar, 
    CalendarHeader, 
    CalendarGrid, 
    DayDetailsSheet 
} from "@/features/calendar";
import { MOCK_PROCTOR_EXAMS } from '@sentinel/shared/constants';
import { useMemo } from "react";

export default function ProctorCalendarPage() {
    const events = useMemo(() => 
        MOCK_PROCTOR_EXAMS.filter((exam) => exam.scheduledDate).map((exam) => ({
            id: exam.id,
            title: exam.title,
            date: new Date(exam.scheduledDate!),
            type: 'exam',
            description: exam.description || '',
            duration: exam.duration,
            studentsCount: exam.studentsCount ?? 0,
        })), []);

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
    } = useCalendar({ events });

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
