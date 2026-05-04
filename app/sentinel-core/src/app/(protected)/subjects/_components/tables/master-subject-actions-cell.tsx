'use client';

import {
    useActivePermissions,
    useDeleteSubjectMutation,
    useSubjectOfferingsQuery,
} from '@sentinel/hooks';
import { useState } from 'react';
import { Edit2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { type MasterSubject } from '@sentinel/shared/types';
import { EditSubjectDialog } from '../dialogs/edit-subject-dialog';
import { OfferSubjectDialog } from '../dialogs/offer-subject-dialog';
import { Button } from '@sentinel/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';

interface MasterSubjectActionsCellProps {
    subject: MasterSubject;
    canManageCatalog?: boolean;
}

export function MasterSubjectActionsCell({ subject }: MasterSubjectActionsCellProps) {
    const { hasPermission } = useActivePermissions();
    const [editOpen, setEditOpen] = useState(false);
    const [offerOpen, setOfferOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteSubject = useDeleteSubjectMutation();
    const subjectId = subject.id;
    const { data: existingOfferings = [], isLoading: isLoadingOfferings } =
        useSubjectOfferingsQuery({
            subjectId: subjectId ?? '',
            enabled: deleteOpen && Boolean(subjectId),
        });
    const offeringCount = existingOfferings.length;
    const hasOfferings = offeringCount > 0;
    const canOfferSubject = hasPermission('subject_offerings:offer');
    const canUpdateSubject = hasPermission('subjects:update');
    const canDeleteSubject = hasPermission('subjects:delete');
    const isInheritedSubject = isParentOwnedRecord(subject);
    const deleteDescription = hasOfferings
        ? `This subject still has ${offeringCount} offered subject${offeringCount === 1 ? '' : 's'}. Unoffer ${offeringCount === 1 ? 'it' : 'them'} first from Offered Subjects before deleting "${subject.code} - ${subject.title}".`
        : isInheritedSubject
          ? `This will create a local hide for "${subject.code} - ${subject.title}" in your branch only. The parent subject will remain unchanged for other branches.`
          : `This will permanently delete "${subject.code} - ${subject.title}".`;

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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subject.code)}>
                        Copy subject code
                    </DropdownMenuItem>
                    {subjectId && (
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subjectId)}>
                            Copy subject ID
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {canOfferSubject ? (
                        <DropdownMenuItem
                            onClick={() => {
                                if (subjectId) {
                                    setOfferOpen(true);
                                }
                            }}
                            disabled={!subjectId}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Offer This Subject
                        </DropdownMenuItem>
                    ) : null}
                    {canUpdateSubject && (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            {isInheritedSubject ? 'Create Local Override' : 'Edit Details'}
                        </DropdownMenuItem>
                    )}
                    {canDeleteSubject && (
                        <DropdownMenuItem
                            onClick={() => {
                                if (subjectId) {
                                    setDeleteOpen(true);
                                }
                            }}
                            disabled={!subjectId}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isInheritedSubject ? 'Hide Locally' : 'Delete Subject'}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateSubject && (
                <EditSubjectDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    subjectToEdit={subject}
                />
            )}

            {canOfferSubject ? (
                <OfferSubjectDialog
                    open={offerOpen}
                    onOpenChange={setOfferOpen}
                    subjectToOffer={subject}
                />
            ) : null}

            {canDeleteSubject && (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                        <DialogHeader>
                            <DialogTitle>
                                {isInheritedSubject ? 'Hide inherited subject?' : 'Delete Subject?'}
                            </DialogTitle>
                            <DialogDescription>
                                {isLoadingOfferings
                                    ? 'Checking for existing offered subjects...'
                                    : deleteDescription}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                                disabled={deleteSubject.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (!subjectId) {
                                        return;
                                    }

                                    deleteSubject.mutate(subjectId, {
                                        onSuccess: () => setDeleteOpen(false),
                                    });
                                }}
                                disabled={
                                    !subjectId ||
                                    deleteSubject.isPending ||
                                    isLoadingOfferings ||
                                    hasOfferings
                                }
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteSubject.isPending
                                    ? 'Deleting...'
                                    : hasOfferings
                                      ? 'Unoffer First'
                                      : isInheritedSubject
                                        ? 'Hide Locally'
                                        : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
