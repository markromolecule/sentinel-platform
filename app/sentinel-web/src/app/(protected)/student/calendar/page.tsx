'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

import {
    Button,
    Input,
    Textarea,
    Label,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Skeleton,
} from '@sentinel/ui';
import {
    useCalendar,
    CalendarHeader,
    CalendarGrid,
    DayDetailsSheet,
} from '@/features/calendar';
import { useCalendarEventsQuery, useCreateCalendarEventMutation, useDeleteCalendarEventMutation } from '@sentinel/hooks';

export default function StudentCalendarPage() {
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

    // Note Form State
    const [noteTitle, setNoteTitle] = useState('');
    const [noteDesc, setNoteDesc] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Calendar state helper hook
    const {
        currentMonth,
        selectedDate,
        isDetailsOpen,
        setIsDetailsOpen,
        calendarDays,
        handlePreviousMonth,
        handleNextMonth,
        handleDayClick,
    } = useCalendar({ events: [] });

    // Dynamic month/year mapping for active queries
    const payload = useMemo(() => {
        return {
            month: currentMonth.getMonth() + 1,
            year: currentMonth.getFullYear(),
        };
    }, [currentMonth]);

    // Query events from Hono API
    const { data: rawEvents, isLoading } = useCalendarEventsQuery({
        payload,
    });

    // Mutation hooks
    const { mutate: createNote, isPending: isCreating, error: createError, isError: isCreateError } = useCreateCalendarNoteMutation({
        onSuccess: () => {
            setIsAddNoteOpen(false);
        },
    });

    const { mutate: deleteNote } = useDeleteCalendarNoteMutation();

    // Map CalendarEventResponse[] to CalendarEvent[]
    const mappedEvents = useMemo(() => {
        if (!rawEvents) return [];
        return rawEvents.map((event) => ({
            id: event.eventId,
            title: event.title,
            date: new Date(event.startDate),
            type: event.eventType === 'NOTE' ? 'note' : event.eventType.toLowerCase(),
            description: event.description || '',
            startTime: event.startTime || undefined,
            endTime: event.endTime || undefined,
        }));
    }, [rawEvents]);

    // Re-initialize dynamic getEventsForDate on the fly
    const getEventsForDate = useMemo(() => {
        return (date: Date) => {
            return mappedEvents.filter(
                (event) =>
                    event.date.getDate() === date.getDate() &&
                    event.date.getMonth() === date.getMonth() &&
                    event.date.getFullYear() === date.getFullYear(),
            );
        };
    }, [mappedEvents]);

    // Handlers
    const handleOpenAddNote = () => {
        setNoteTitle('');
        setNoteDesc('');
        setStartTime('');
        setEndTime('');
        setIsAddNoteOpen(true);
    };

    const handleSaveNote = () => {
        if (!selectedDate || !noteTitle) return;

        createNote({
            title: noteTitle,
            description: noteDesc || undefined,
            startDate: selectedDate.toISOString(),
            startTime: startTime || undefined,
            endTime: endTime || undefined,
        });
    };

    const handleDeleteNote = (noteId: string) => {
        deleteNote({ eventId: noteId });
    };

    return (
        <div className="mx-auto max-w-[1600px] space-y-6 pb-24 md:pb-20">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 py-4 md:flex-row md:items-center">
                <div>
                    <h1 className="bg-gradient-to-r from-[#323d8f] to-[#4a5bb8] bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                        Calendar
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg">
                        Manage your schedule and personal reminders.
                    </p>
                </div>

                <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
                    <CalendarHeader
                        currentMonth={currentMonth}
                        onPreviousMonth={handlePreviousMonth}
                        onNextMonth={handleNextMonth}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="bg-card border-border flex flex-1 flex-col overflow-hidden rounded-xl border p-4 shadow-sm">
                    <div className="grid flex-1 grid-cols-7 gap-2 auto-rows-fr">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <Skeleton key={i} className="min-h-[100px] w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            ) : (
                <CalendarGrid
                    currentMonth={currentMonth}
                    calendarDays={calendarDays}
                    onDayClick={handleDayClick}
                    getEventsForDate={getEventsForDate}
                />
            )}

            <DayDetailsSheet
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                selectedDate={selectedDate}
                getEventsForDate={getEventsForDate}
                onDeleteEvent={handleDeleteNote}
                renderActions={() => (
                    <Button
                        onClick={handleOpenAddNote}
                        className="w-full bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Note
                    </Button>
                )}
            />

            {/* Add Note Dialog */}
            <Dialog open={isAddNoteOpen} onOpenChange={setIsAddNoteOpen}>
                <DialogContent className="bg-background border-border text-foreground sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Add New Note</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Create a reminder for{' '}
                            {selectedDate ? format(selectedDate, 'MMMM d') : 'this date'}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {isCreateError && (
                            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-xs font-semibold animate-shake">
                                {createError?.message || 'Failed to save note. Please check your inputs.'}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label
                                htmlFor="title"
                                className="text-muted-foreground text-[10px] font-bold uppercase"
                            >
                                Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g., Study Session"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                className="bg-muted/50 border-border text-foreground focus:border-primary"
                                disabled={isCreating}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="start"
                                    className="text-muted-foreground text-[10px] font-bold uppercase"
                                >
                                    Start Time
                                </Label>
                                <Input
                                    id="start"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="bg-muted/50 border-border text-foreground focus:border-primary"
                                    disabled={isCreating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="end"
                                    className="text-muted-foreground text-[10px] font-bold uppercase"
                                >
                                    End Time
                                </Label>
                                <Input
                                    id="end"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="bg-muted/50 border-border text-foreground focus:border-primary"
                                    disabled={isCreating}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="desc"
                                className="text-muted-foreground text-[10px] font-bold uppercase"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="desc"
                                placeholder="Add details..."
                                value={noteDesc}
                                onChange={(e) => setNoteDesc(e.target.value)}
                                className="bg-muted/50 border-border text-foreground focus:border-primary min-h-[100px]"
                                disabled={isCreating}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsAddNoteOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                            disabled={isCreating || !noteTitle}
                        >
                            {isCreating ? 'Saving...' : 'Save Note'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
