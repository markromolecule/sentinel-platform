'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useDeleteClassroomMutation } from '@sentinel/hooks';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { type ClassroomSummary } from '@sentinel/shared/types';
import { toast } from 'sonner';

type ClassroomActionCellProps = {
    classroom: ClassroomSummary;
};

export function ClassroomActionCell({ classroom }: ClassroomActionCellProps) {
    const [open, setOpen] = useState(false);
    const deleteClassroomMutation = useDeleteClassroomMutation({
        onSuccess: () => {
            setOpen(false);
            toast.success('Classroom deleted successfully');
        },
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open classroom actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/classrooms/${classroom.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        onClick={() => setOpen(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this classroom?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the classroom
                            &quot;{classroom.className || classroom.scopeSummary.sectionLabel}
                            &quot; and remove its roster entries.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteClassroomMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteClassroomMutation.mutate(classroom.id)}
                            disabled={deleteClassroomMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleteClassroomMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
