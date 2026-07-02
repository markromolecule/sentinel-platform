import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@sentinel/ui';

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday?: () => void;
    emptyStateHint?: string;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onToday,
    emptyStateHint,
}: CalendarHeaderProps) {
    return (
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-h-5 text-sm text-zinc-500">
                {emptyStateHint ? <p>{emptyStateHint}</p> : null}
            </div>
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
