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
    Badge,
} from '@sentinel/ui';
import { useRoomsQuery, useUpdateExamMutation } from '@sentinel/hooks';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export interface AssignRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examId?: string;
    initialRoomId?: string | null;
    onSuccess?: () => void;
}

export function AssignRoomDialog({
    open,
    onOpenChange,
    examId,
    initialRoomId,
    onSuccess,
}: AssignRoomDialogProps) {
    const [selectedRoomId, setSelectedRoomId] = React.useState<string>(initialRoomId ?? 'none');

    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const updateMutation = useUpdateExamMutation({
        onSuccess: () => {
            toast.success('Room assigned successfully');
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err?.message ?? 'Failed to assign room');
        },
    });

    React.useEffect(() => {
        if (open) {
            setSelectedRoomId(initialRoomId ?? 'none');
        }
    }, [open, initialRoomId]);

    const isPending = updateMutation.isPending;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!examId) {
            return;
        }

        const roomIdValue = selectedRoomId === 'none' ? null : selectedRoomId;

        await updateMutation.mutateAsync({
            id: examId,
            payload: {
                roomId: roomIdValue,
            },
        });
    };

    // Filter out maintenance rooms
    const activeRooms = rooms.filter((room: any) => room.status !== 'MAINTENANCE');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Classroom Room</DialogTitle>
                    <DialogDescription>
                        Select a room from the available rooms list to schedule this exam.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="room-select">Select Room</Label>
                        {isRoomsLoading ? (
                            <div className="border-input flex h-10 items-center justify-center rounded-md border px-3">
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                <span className="ml-2 text-sm text-zinc-500">Loading rooms...</span>
                            </div>
                        ) : (
                            <Select
                                value={selectedRoomId}
                                onValueChange={setSelectedRoomId}
                                disabled={isPending}
                            >
                                <SelectTrigger id="room-select" className="w-full">
                                    <SelectValue placeholder="Select a classroom" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Room Assigned</SelectItem>
                                    {activeRooms.map((room: any) => (
                                        <SelectItem key={room.room_id} value={room.room_id}>
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <span>
                                                    {room.room_name} ({room.room_number})
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        room.status === 'AVAILABLE'
                                                            ? 'border-none bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                                            : 'border-none bg-amber-50 text-amber-700 hover:bg-amber-50'
                                                    }
                                                >
                                                    {room.status}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
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
                            disabled={isPending || isRoomsLoading || !examId}
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
