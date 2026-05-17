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
import { EditSectionDialog } from '@/app/(protected)/sections/_components/dialogs/edit-section-dialog';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';

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
    const isInheritedSection = isParentOwnedRecord(section);
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
    const deleteTitle = isInheritedSection ? 'Hide inherited section?' : 'Delete section?';
    const deleteDescription = isInheritedSection
        ? `This will create a local hide for "${section.name}" in your branch only. The parent section will remain available to other branches.`
        : `This action cannot be undone. This will permanently delete "${section.name}" and remove it from the system.`;
    const deleteButtonLabel = deleteSection.isPending
        ? isInheritedSection
            ? 'Hiding...'
            : 'Deleting...'
        : isInheritedSection
            ? 'Hide Locally'
            : 'Delete';

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
                            <Edit2 className="mr-2 h-4 w-4" />
                            {isInheritedSection ? 'Create Local Override' : 'Edit'}
                        </DropdownMenuItem>
                    ) : null}
                    {canDeleteSection ? (
                        <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isInheritedSection ? 'Hide Locally' : 'Delete'}
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
                                <DialogTitle>{deleteTitle}</DialogTitle>
                                <DialogDescription>{deleteDescription}</DialogDescription>
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
                                    {deleteButtonLabel}
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
