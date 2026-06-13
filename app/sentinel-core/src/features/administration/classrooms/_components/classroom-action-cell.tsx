'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    useDeleteClassroomMutation,
    useArchiveClassroomMutation,
    useUnarchiveClassroomMutation,
} from '@sentinel/hooks';
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
import { Archive, ArchiveRestore, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { type ClassroomSummary } from '@sentinel/shared/types';
import { toast } from 'sonner';
import { PermissionGate } from '@/features/administration/shared/permission-gate';

type ClassroomActionCellProps = {
    classroom: ClassroomSummary;
};

export function ClassroomActionCell({ classroom }: ClassroomActionCellProps) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [unarchiveOpen, setUnarchiveOpen] = useState(false);

    const deleteClassroomMutation = useDeleteClassroomMutation({
        onSuccess: () => {
            setDeleteOpen(false);
            toast.success('Classroom deleted successfully');
        },
    });

    const archiveClassroomMutation = useArchiveClassroomMutation({
        onSuccess: () => {
            setArchiveOpen(false);
            toast.success('Classroom archived successfully');
        },
    });

    const unarchiveClassroomMutation = useUnarchiveClassroomMutation({
        onSuccess: () => {
            setUnarchiveOpen(false);
            toast.success('Classroom unarchived successfully');
        },
    });

    const isArchived = Boolean(classroom.archivedAt);

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
                    <PermissionGate permission="classrooms" action="edit">
                        {isArchived ? (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setUnarchiveOpen(true)}
                            >
                                <ArchiveRestore className="mr-2 h-4 w-4" />
                                Unarchive
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setArchiveOpen(true)}
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </DropdownMenuItem>
                        )}
                    </PermissionGate>
                    <PermissionGate permission="classrooms" action="edit">
                        <DropdownMenuItem
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </PermissionGate>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
                        <Button
                            onClick={() => deleteClassroomMutation.mutate(classroom.id)}
                            disabled={deleteClassroomMutation.isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleteClassroomMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Archive Confirmation */}
            <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive this classroom?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will archive the classroom &quot;
                            {classroom.className || classroom.scopeSummary.sectionLabel}&quot;. It
                            will be hidden from the active listings for both students and
                            instructors, but all scores, exams, and enrollment histories will be
                            preserved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={archiveClassroomMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={() => archiveClassroomMutation.mutate(classroom.id)}
                            disabled={archiveClassroomMutation.isPending}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            {archiveClassroomMutation.isPending ? 'Archiving...' : 'Archive'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unarchive Confirmation */}
            <AlertDialog open={unarchiveOpen} onOpenChange={setUnarchiveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unarchive this classroom?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore the classroom &quot;
                            {classroom.className || classroom.scopeSummary.sectionLabel}&quot; to
                            active listings.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={unarchiveClassroomMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={() => unarchiveClassroomMutation.mutate(classroom.id)}
                            disabled={unarchiveClassroomMutation.isPending}
                            className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        >
                            {unarchiveClassroomMutation.isPending ? 'Unarchiving...' : 'Unarchive'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
