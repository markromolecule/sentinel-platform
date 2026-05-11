'use client';

import { useActivePermissions, useDeleteInstitutionMutation } from '@sentinel/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { Institution } from '@sentinel/shared/types';

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

import { EditInstitutionDialog } from '@/app/(protected)/(support)/institutions/_components/dialogs/edit-institution-dialog';
import { InstitutionWizardDialog } from '@/app/(protected)/(support)/institutions/_components/dialogs/institution-wizard-dialog';

interface InstitutionActionsCellProps {
    institution: Institution;
    institutions?: Institution[];
}

export const InstitutionActionsCell = ({
    institution,
    institutions = [],
}: InstitutionActionsCellProps) => {
    const { hasPermission } = useActivePermissions();
    const [editOpen, setEditOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const canUpdateInstitution = hasPermission('institutions:update');
    const canDeleteInstitution = hasPermission('institutions:delete');
    const parentInstitution = institutions.find(
        (candidate) => candidate.id === institution.parentInstitutionId,
    );
    const branchCount = institutions.filter(
        (candidate) => candidate.parentInstitutionId === institution.id,
    ).length;

    const deleteMutation = useDeleteInstitutionMutation({
        onSuccess: () => {
            toast.success('Institution deleted successfully');
            setDeleteOpen(false);
        },
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(institution.id);
                        }}
                    >
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            setDetailOpen(true);
                        }}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        View Hierarchy
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canUpdateInstitution ? (
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditOpen(true);
                            }}
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                    ) : null}
                    {canDeleteInstitution ? (
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteOpen(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Institution
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateInstitution ? (
                institution.institutionKind === 'PARENT' ? (
                    <InstitutionWizardDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        institution={institution}
                    />
                ) : (
                    <EditInstitutionDialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                        institutionToEdit={institution}
                    />
                )
            ) : null}

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>{institution.name}</DialogTitle>
                        <DialogDescription>
                            Institution hierarchy and inheritance summary.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-muted-foreground">Kind</span>
                            <span className="font-medium">
                                {institution.institutionKind ?? 'STANDALONE'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-muted-foreground">Parent institution</span>
                            <span className="max-w-[260px] truncate font-medium">
                                {institution.institutionKind === 'PARENT'
                                    ? 'N/A (Root Institution)'
                                    : (parentInstitution?.name ??
                                      institution.parentInstitutionId ??
                                      'None')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <span className="text-muted-foreground">Branches</span>
                            <span className="font-medium">
                                {institution.institutionKind === 'PARENT' ? branchCount : '—'}
                            </span>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground">Inheritance status</p>
                            <p className="mt-1 font-medium">
                                {institution.institutionKind === 'CHILD'
                                    ? 'Inherits parent template data with local overrides.'
                                    : institution.institutionKind === 'PARENT'
                                      ? 'Provides template data to linked branches.'
                                      : 'Uses local institution data only.'}
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {canDeleteInstitution ? (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the
                                institution &quot;{institution.name}&quot; and remove it from the
                                servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(institution.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
};
