import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@sentinel/ui';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday?: () => void;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onToday,
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
                {onToday ? (
                    <Button variant="outline" onClick={onToday}>
                        Today
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
