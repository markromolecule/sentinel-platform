'use client';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Users } from 'lucide-react';
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
                <SheetContent className="overflow-y-auto">
                    <SheetHeader className="mb-8">
                        <SheetTitle className="flex items-center gap-2">
                            <CalendarIcon className="text-primary h-5 w-5" />
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                        </SheetTitle>
                        <SheetDescription>Events and announcements for this day.</SheetDescription>
                    </SheetHeader>

                    {selectedDate && (
                        <div className="space-y-8">
                            <Button
                                className="w-full"
                                onClick={() => {
                                    onOpenChange(false);
                                    onAddEvent();
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Event
                            </Button>

                            <div className="space-y-5">
                                {events.length === 0 ? (
                                    <div className="text-muted-foreground rounded-lg border-2 border-dashed py-8 text-center">
                                        No events planned
                                    </div>
                                ) : (
                                    events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-card group relative rounded-lg border p-6 shadow-sm"
                                        >
                                            {event.createdBy === user?.id && (
                                                <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRequestDelete(event.id, event.title);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="mb-3 flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
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
                                                {/* Show audience badge when not the default 'institution' (all users) audience */}
                                                {event.targetAudience !== 'institution' && (
                                                    <span className="bg-muted text-muted-foreground flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                                        <Users className="h-3 w-3" />
                                                        {event.targetAudience}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="mb-1 text-base font-semibold">
                                                {event.title}
                                            </h3>
                                            {(event.startTime || event.endTime) && (
                                                <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    {event.startTime || '--:--'} -{' '}
                                                    {event.endTime || '--:--'}
                                                </div>
                                            )}
                                            <p className="text-muted-foreground text-sm">
                                                {event.description}
                                            </p>
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
