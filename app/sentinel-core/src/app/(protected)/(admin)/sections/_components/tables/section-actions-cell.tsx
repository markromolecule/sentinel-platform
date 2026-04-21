'use client';

import { useDeleteSectionMutation } from '@/data';
import { useActivePermissions } from '@sentinel/hooks';
import { ApiError } from '@sentinel/services';
import { useState } from 'react';
import { toast } from 'sonner';
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Section } from '@sentinel/shared/types';

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
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { EditSectionDialog } from '@/app/(protected)/(admin)/sections/_components/dialogs/edit-section-dialog';

interface SectionActionsCellProps {
    section: Section;
}

export const SectionActionsCell = ({ section }: SectionActionsCellProps) => {
    const { hasPermission } = useActivePermissions();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const canUpdateSection = hasPermission('sections:update');
    const canDeleteSection = hasPermission('sections:delete');

    const deleteSection = useDeleteSectionMutation({
        onSuccess: () => {
            toast.success('Section deleted successfully');
            setDeleteOpen(false);
        },
        onError: (error) => {
            if (error instanceof ApiError && error.status === 409) {
                setErrorMessage(error.message);
                setErrorDialogOpen(true);
                setDeleteOpen(false);
            }
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(section.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canUpdateSection ? (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                    ) : null}
                    {canDeleteSection ? (
                        <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateSection ? (
                <EditSectionDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    sectionToEdit={section}
                />
            ) : null}

            {canDeleteSection ? (
                <>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                            <DialogHeader>
                                <DialogTitle>Delete Section?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete &quot;
                                    {section.name}&quot; and remove it from the system.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteSection.mutate(section.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleteSection.isPending}
                                >
                                    {deleteSection.isPending ? 'Deleting...' : 'Delete'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cannot Delete Section</AlertDialogTitle>
                                <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
                                    OK
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            ) : null}
        </>
    );
};
