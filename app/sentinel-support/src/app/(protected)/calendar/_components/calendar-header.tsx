'use client';

import { Button } from '@sentinel/ui';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onAddEvent: () => void;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onAddEvent,
}: CalendarHeaderProps) {
    return (
        <div className="flex items-center gap-2">
            <Button onClick={onAddEvent} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
            </Button>
            <div className="bg-card flex items-center rounded-md border">
                <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[140px] px-4 text-center font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button variant="ghost" size="icon" onClick={onNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
