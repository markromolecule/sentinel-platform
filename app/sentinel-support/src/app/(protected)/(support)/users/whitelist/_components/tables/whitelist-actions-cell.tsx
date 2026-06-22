'use client';

import { useState } from 'react';
import { ArrowRightLeft, Edit2, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { useDeleteStudentWhitelistMutation, PermissionGuard } from '@sentinel/hooks';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { StudentWhitelist } from '@sentinel/shared/types';
import { EditStudentWhitelistDialog } from '@/app/(protected)/(support)/users/whitelist/_components/dialogs/edit-student-whitelist-dialog';
import { useStudentWhitelistScope } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-scope';

interface WhitelistActionsCellProps {
    record: StudentWhitelist;
}

/**
 * Dropdown action menu cell for an individual student whitelist record.
 */
export function WhitelistActionsCell({ record }: WhitelistActionsCellProps) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { isSuperadmin } = useStudentWhitelistScope();
    const deleteMutation = useDeleteStudentWhitelistMutation({
        onSuccess: () => {
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(record.id)}>
                        Copy Entry ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <PermissionGuard permission="student_whitelist:update">
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            {isSuperadmin ? (
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                            ) : (
                                <Edit2 className="mr-2 h-4 w-4" />
                            )}
                            {isSuperadmin ? 'Reassign Program Scope' : 'Edit Entry'}
                        </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard permission="student_whitelist:delete">
                        <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            disabled={!!record.claimedUserId}
                            onClick={() => setDeleteOpen(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Entry
                        </DropdownMenuItem>
                    </PermissionGuard>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditStudentWhitelistDialog
                record={record}
                open={editOpen}
                onOpenChange={setEditOpen}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete whitelist entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently permanently removes the whitelist record for student
                            number{' '}
                            <span className="text-foreground font-medium">
                                {record.studentNumber}
                            </span>
                            . Claimed whitelist entries must be released by deleting the linked
                            student account first.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-white"
                            disabled={deleteMutation.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                deleteMutation.mutate(record.id);
                            }}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Entry'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
