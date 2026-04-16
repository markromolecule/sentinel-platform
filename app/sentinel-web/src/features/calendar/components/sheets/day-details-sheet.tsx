import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, Trash2 } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Button,
} from '@sentinel/ui';
import { CalendarEvent } from '../../types';

interface DayDetailsSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date | null;
    getEventsForDate: (date: Date) => CalendarEvent[];
    onDeleteEvent?: (id: string) => void;
    renderActions?: () => React.ReactNode;
}

export function DayDetailsSheet({
    isOpen,
    onOpenChange,
    selectedDate,
    getEventsForDate,
    onDeleteEvent,
    renderActions,
}: DayDetailsSheetProps) {
    const events = selectedDate ? getEventsForDate(selectedDate) : [];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarIcon className="text-primary h-5 w-5" />
                        {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                    </SheetTitle>
                    <SheetDescription>Events scheduled for this day.</SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {renderActions && renderActions()}

                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="border-border bg-muted/50 rounded-xl border border-dashed py-10 text-center">
                                <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                                    <CalendarIcon className="text-muted-foreground h-6 w-6" />
                                </div>
                                <p className="text-muted-foreground">No events scheduled</p>
                            </div>
                        ) : (
                            events.map((event) => (
                                <div
                                    key={event.id}
                                    className={cn(
                                        'bg-card group relative rounded-xl border p-4 shadow-sm',
                                        event.type === 'exam' &&
                                            'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent',
                                    )}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="space-y-1">
                                            {event.type === 'exam' && (
                                                <div className="mb-1 flex items-center gap-2 text-amber-600 dark:text-amber-500">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-xs font-bold tracking-wider uppercase">
                                                        Exam
                                                    </span>
                                                </div>
                                            )}
                                            <h3 className="text-foreground text-lg font-bold">
                                                {event.title}
                                            </h3>
                                        </div>
                                        {onDeleteEvent && event.type === 'note' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive -mt-2 -mr-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={() => onDeleteEvent(event.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-4 text-xs font-medium">
                                        {event.type === 'exam' ? (
                                            <>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {event.duration} mins
                                                </div>
                                                {event.studentsCount !== undefined && (
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {event.studentsCount} students
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            (event.startTime || event.endTime) && (
                                                <div className="text-primary flex items-center gap-1 font-bold">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {event.startTime || '...'} -{' '}
                                                    {event.endTime || '...'}
                                                </div>
                                            )
                                        )}
                                    </div>
                                    {event.description && (
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

import { cn } from '@sentinel/ui';
