'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@sentinel/ui';
import { AdminEvent } from '@sentinel/shared/types';
import { useState } from 'react';
import { DeleteEventConfirmDialog } from './delete-event-confirm-dialog';
import { useAuth } from '@sentinel/hooks';

interface EventDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date | null;
    getEventsForDate: (date: Date) => AdminEvent[];
    onAddEvent: () => void;
    onDeleteEvent: (id: string) => void;
}

export function EventDetailsSheet({
    open,
    onOpenChange,
    selectedDate,
    getEventsForDate,
    onAddEvent,
    onDeleteEvent,
}: EventDetailsSheetProps) {
    const events = selectedDate ? getEventsForDate(selectedDate) : [];

    // Pending delete state — holds the event to be confirmed before deletion
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [pendingDeleteTitle, setPendingDeleteTitle] = useState('');

    const { user } = useAuth();

    /** Stage an event for deletion — shows the confirmation dialog. */
    const handleRequestDelete = (id: string, title: string) => {
        setPendingDeleteId(id);
        setPendingDeleteTitle(title);
    };

    /** Called when the user confirms deletion inside the AlertDialog. */
    const handleConfirmDelete = () => {
        if (pendingDeleteId) {
            onDeleteEvent(pendingDeleteId);
            setPendingDeleteId(null);
            setPendingDeleteTitle('');
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetHeader className="border-border gap-2 border-b px-5 py-5">
                        <SheetTitle className="flex items-center gap-2 text-2xl">
                            <CalendarIcon className="text-primary h-5 w-5" />
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                        </SheetTitle>
                        <SheetDescription className="text-sm leading-6">
                            {events.length === 0
                                ? 'No events scheduled for this day yet.'
                                : `${events.length} item${events.length === 1 ? '' : 's'} scheduled for this day.`}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedDate && (
                        <div className="space-y-3 px-4 py-4">
                            <Button
                                className="h-10 w-full rounded-lg text-sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onAddEvent();
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Event
                            </Button>

                            <div className="space-y-2.5">
                                {events.length === 0 ? (
                                    <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm">
                                        No events planned
                                    </div>
                                ) : (
                                    events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-card group relative rounded-lg border px-3.5 py-3 shadow-sm"
                                        >
                                            {event.createdBy === user?.id && (
                                                <div className="absolute top-2.5 right-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRequestDelete(
                                                                event.id,
                                                                event.title,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="mb-2 flex flex-wrap items-center gap-1.5 pr-7">
                                                <span
                                                    className={cn(
                                                        'rounded-md px-2 py-0.75 text-[10px] font-bold tracking-wide uppercase',
                                                        event.type === 'maintenance' &&
                                                            'bg-destructive/10 text-destructive',
                                                        event.type === 'announcement' &&
                                                            'bg-amber-500/10 text-amber-600',
                                                        event.type === 'event' &&
                                                            'bg-primary/10 text-primary',
                                                    )}
                                                >
                                                    {event.type}
                                                </span>
                                                {event.targetAudience !== 'institution' && (
                                                    <span className="bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-2 py-0.75 text-[10px] font-bold tracking-wide uppercase">
                                                        <Users className="h-3 w-3" />
                                                        {event.targetAudience}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mb-1 text-base leading-tight font-semibold">
                                                {event.title}
                                            </h3>
                                            {(event.startTime || event.endTime) && (
                                                <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-sm">
                                                    <Clock className="h-3 w-3" />
                                                    {event.startTime || '--:--'} -{' '}
                                                    {event.endTime || '--:--'}
                                                </div>
                                            )}
                                            {(event.createdByName || event.createdBy) && (
                                                <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
                                                    <User className="h-3 w-3" />
                                                    Posted by{' '}
                                                    {event.createdByName || event.createdBy}
                                                </div>
                                            )}
                                            {event.description ? (
                                                <p className="text-muted-foreground text-sm leading-5">
                                                    {event.description}
                                                </p>
                                            ) : (
                                                <p className="text-muted-foreground text-sm italic">
                                                    No additional description.
                                                </p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <DeleteEventConfirmDialog
                open={pendingDeleteId !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setPendingDeleteId(null);
                        setPendingDeleteTitle('');
                    }
                }}
                eventTitle={pendingDeleteTitle}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}
