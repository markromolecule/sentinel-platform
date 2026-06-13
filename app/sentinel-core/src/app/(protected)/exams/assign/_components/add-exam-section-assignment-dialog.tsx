'use client';

import * as React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Input,
} from '@sentinel/ui';
import {
    useSectionsQuery,
    useRoomsQuery,
    useUsersQuery,
    useCreateExamSectionAssignmentMutation,
} from '@sentinel/hooks';
import { type Section, type Room } from '@sentinel/shared/types';
import { type User, type CreateExamSectionAssignmentPayload } from '@sentinel/services';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface AddExamSectionAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examId: string;
    onSuccess?: () => void;
}

export function AddExamSectionAssignmentDialog({
    open,
    onOpenChange,
    examId,
    onSuccess,
}: AddExamSectionAssignmentDialogProps) {
    const [sectionId, setSectionId] = React.useState<string>('none');
    const [roomId, setRoomId] = React.useState<string>('none');
    const [instructorId, setInstructorId] = React.useState<string>('none');
    const [scheduledAt, setScheduledAt] = React.useState<string>('');

    const { data: sections = [], isLoading: isSectionsLoading } = useSectionsQuery();
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { data: users = [], isLoading: isUsersLoading } = useUsersQuery();

    const createMutation = useCreateExamSectionAssignmentMutation({
        onSuccess: () => {
            toast.success('Section assigned successfully');
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to assign section');
        },
    });

    React.useEffect(() => {
        if (open) {
            setSectionId('none');
            setRoomId('none');
            setInstructorId('none');
            setScheduledAt('');
        }
    }, [open]);

    const isPending = createMutation.isPending;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!examId) {
            toast.error('Exam ID is required');
            return;
        }

        if (sectionId === 'none') {
            toast.error('Section is required');
            return;
        }

        const payload: CreateExamSectionAssignmentPayload = {
            sectionId,
        };

        if (roomId !== 'none') {
            payload.roomId = roomId;
        }
        if (instructorId !== 'none') {
            payload.instructorId = instructorId;
        }
        if (scheduledAt) {
            payload.scheduledAt = new Date(scheduledAt).toISOString();
        }

        await createMutation.mutateAsync({
            examId,
            payload,
        });
    };

    // Filter out maintenance rooms
    const activeRooms = (rooms as Room[]).filter((room: Room) => room.status !== 'MAINTENANCE');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Exam to Section</DialogTitle>
                    <DialogDescription>
                        Link a section, and optionally schedule a room and instructor/proctor for this exam.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Section Select */}
                    <div className="space-y-2">
                        <Label htmlFor="section-select">Section (Required)</Label>
                        {isSectionsLoading ? (
                            <div className="border-input flex h-10 items-center justify-center rounded-md border px-3">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                <span className="ml-2 text-sm text-zinc-500">Loading sections...</span>
                            </div>
                        ) : (
                            <Select
                                value={sectionId}
                                onValueChange={setSectionId}
                                disabled={isPending}
                            >
                                <SelectTrigger id="section-select" className="w-full">
                                    <SelectValue placeholder="Select a section" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none" disabled>Select a section</SelectItem>
                                    {(sections as Section[]).map((sec: Section) => (
                                        <SelectItem key={sec.id} value={sec.id}>
                                            {sec.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Room Select */}
                    <div className="space-y-2">
                        <Label htmlFor="room-select">Room (Optional)</Label>
                        {isRoomsLoading ? (
                            <div className="border-input flex h-10 items-center justify-center rounded-md border px-3">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                <span className="ml-2 text-sm text-zinc-500">Loading rooms...</span>
                            </div>
                        ) : (
                            <Select
                                value={roomId}
                                onValueChange={setRoomId}
                                disabled={isPending}
                            >
                                <SelectTrigger id="room-select" className="w-full">
                                    <SelectValue placeholder="No room assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No room assigned</SelectItem>
                                    {activeRooms.map((room: Room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.name} ({room.room_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Instructor Select */}
                    <div className="space-y-2">
                        <Label htmlFor="instructor-select">Instructor / Proctor (Optional)</Label>
                        {isUsersLoading ? (
                            <div className="border-input flex h-10 items-center justify-center rounded-md border px-3">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                <span className="ml-2 text-sm text-zinc-500">Loading instructors...</span>
                            </div>
                        ) : (
                            <Select
                                value={instructorId}
                                onValueChange={setInstructorId}
                                disabled={isPending}
                            >
                                <SelectTrigger id="instructor-select" className="w-full">
                                    <SelectValue placeholder="No instructor assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No instructor assigned</SelectItem>
                                    {(users as User[]).map((user: User) => {
                                        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                        return (
                                            <SelectItem key={user.id} value={user.id}>
                                                {name || user.email}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Scheduled At Date Input */}
                    <div className="space-y-2">
                        <Label htmlFor="scheduled-at">Scheduled Date & Time (Optional)</Label>
                        <Input
                            id="scheduled-at"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || sectionId === 'none'}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Assignment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
