'use client';

import { Button } from '@sentinel/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
    onAddEvent: () => void;
    canAddEvent?: boolean;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onToday,
    onAddEvent,
    canAddEvent = true,
}: CalendarHeaderProps) {
    return (
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="bg-card flex items-center rounded-xl border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[148px] px-4 text-center text-sm font-semibold">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="outline" onClick={onToday}>
                    Today
                </Button>
                {canAddEvent ? (
                    <Button onClick={onAddEvent} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
