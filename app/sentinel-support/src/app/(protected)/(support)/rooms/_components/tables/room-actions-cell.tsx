'use client';

import { useActivePermissions, useDeleteRoomMutation } from '@sentinel/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Room } from '@sentinel/shared/types';

import { Button } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { EditRoomDialog } from '@/app/(protected)/(support)/rooms/_components/dialogs/edit-room-dialog';

interface RoomActionsCellProps {
    room: Room;
}

export const RoomActionsCell = ({ room }: RoomActionsCellProps) => {
    const { hasPermission } = useActivePermissions();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const canUpdateRoom = hasPermission('rooms:update');
    const canDeleteRoom = hasPermission('rooms:delete');

    const deleteRoom = useDeleteRoomMutation({
        onSuccess: () => {
            toast.success('Room deleted successfully');
            setDeleteOpen(false);
        },
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(room.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canUpdateRoom ? (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                    ) : null}
                    {canDeleteRoom ? (
                        <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Room
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateRoom ? (
                <EditRoomDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    roomToEdit={room}
                />
            ) : null}

            {canDeleteRoom ? (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none data-[state=open]:animate-none data-[state=closed]:animate-none duration-0 transition-none">
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the room
                                &quot;{room.name}&quot; and remove it from the servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteRoom.mutate(room.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteRoom.isPending}
                            >
                                {deleteRoom.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
};
