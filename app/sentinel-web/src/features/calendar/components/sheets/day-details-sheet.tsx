import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, Trash2, User } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Button,
    cn,
} from '@sentinel/ui';
import { useAuth } from '@sentinel/hooks';
import { CalendarEvent } from '../../types';
import { useState } from 'react';
import { DeleteEventConfirmDialog } from './delete-event-confirm-dialog';

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
    const { user } = useAuth();
    const events = selectedDate ? getEventsForDate(selectedDate) : [];

    // Pending delete state — holds the event to be confirmed before deletion
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [pendingDeleteTitle, setPendingDeleteTitle] = useState('');

    /** Stage an event for deletion — shows the confirmation dialog. */
    const handleRequestDelete = (id: string, title: string) => {
        setPendingDeleteId(id);
        setPendingDeleteTitle(title);
    };

    /** Called when the user confirms deletion inside the AlertDialog. */
    const handleConfirmDelete = () => {
        if (pendingDeleteId) {
            onDeleteEvent?.(pendingDeleteId);
            setPendingDeleteId(null);
            setPendingDeleteTitle('');
        }
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent className="overflow-y-auto p-6">
                    <SheetHeader className="mb-6 p-0">
                        <SheetTitle className="flex items-center gap-2">
                            <CalendarIcon className="text-primary h-5 w-5" />
                            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
                        </SheetTitle>
                        <SheetDescription>Events scheduled for this day.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-8">
                        {renderActions && renderActions()}

                        <div className="space-y-5">
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
                                            'bg-card group relative rounded-xl border p-6 shadow-sm',
                                            event.type === 'exam' &&
                                                'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent',
                                            event.type === 'note' &&
                                                'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/10 to-transparent',
                                            event.type === 'holiday' &&
                                                'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent',
                                            event.type === 'announcement' &&
                                                'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/10 to-transparent',
                                            event.type === 'maintenance' &&
                                                'border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-500/10 to-transparent',
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
                                                {event.type === 'note' && (
                                                    <div className="mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="text-xs font-bold tracking-wider uppercase">
                                                            Note
                                                        </span>
                                                    </div>
                                                )}
                                                {event.type === 'holiday' && (
                                                    <div className="mb-1 flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="text-xs font-bold tracking-wider uppercase">
                                                            Holiday
                                                        </span>
                                                    </div>
                                                )}
                                                {event.type === 'announcement' && (
                                                    <div className="mb-1 flex items-center gap-2 text-purple-600 dark:text-purple-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="text-xs font-bold tracking-wider uppercase">
                                                            Announcement
                                                        </span>
                                                    </div>
                                                )}
                                                {event.type === 'maintenance' && (
                                                    <div className="mb-1 flex items-center gap-2 text-rose-600 dark:text-rose-500">
                                                        <Clock className="h-4 w-4" />
                                                        <span className="text-xs font-bold tracking-wider uppercase">
                                                            Maintenance
                                                        </span>
                                                    </div>
                                                )}
                                                <h3 className="text-foreground text-lg font-bold">
                                                    {event.title}
                                                </h3>
                                            </div>
                                            {onDeleteEvent &&
                                                event.type === 'note' &&
                                                user &&
                                                event.createdBy === user.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive -mt-2 -mr-2 h-8 w-8 opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0"
                                                        onClick={() =>
                                                            handleRequestDelete(
                                                                event.id,
                                                                event.title,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                        </div>

                                        <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-4 text-xs font-medium">
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
                                            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}
                                        {event.createdByName && (
                                            <div className="border-border text-muted-foreground mt-3 flex items-center gap-2 border-t pt-3 text-xs">
                                                <User className="h-3.5 w-3.5" />
                                                Posted by{' '}
                                                <span className="font-semibold">
                                                    {event.createdByName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
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
