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
} from '@sentinel/ui';
import {
    useCalendar,
    CalendarHeader,
    CalendarGrid,
    DayDetailsSheet,
    CalendarEvent,
} from '@/features/calendar';
import { MOCK_EXAMS } from '@sentinel/shared/constants';

export default function StudentCalendarPage() {
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

    // Custom Notes State
    const [notes, setNotes] = useState<CalendarEvent[]>([]);

    // Note Form State
    const [noteTitle, setNoteTitle] = useState('');
    const [noteDesc, setNoteDesc] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const examEvents = useMemo(
        () =>
            MOCK_EXAMS.filter((exam) => exam.scheduledDate).map((exam) => ({
                id: exam.id,
                title: exam.title,
                date: new Date(exam.scheduledDate!),
                type: 'exam',
                description: exam.description || '',
                duration: exam.duration,
            })),
        [],
    );

    const allEvents = useMemo(() => [...examEvents, ...notes], [examEvents, notes]);

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
    } = useCalendar({ events: allEvents });

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

        const newNote: CalendarEvent = {
            id: Math.random().toString(36).substr(2, 9),
            date: selectedDate,
            title: noteTitle,
            type: 'note',
            description: noteDesc,
            startTime,
            endTime,
        };

        setNotes([...notes, newNote]);
        setIsAddNoteOpen(false);
    };

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter((n) => n.id !== noteId));
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
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsAddNoteOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            Save Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
