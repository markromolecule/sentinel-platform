'use client';

import { useDeleteDepartmentMutation } from '@/data';
import { useActivePermissions } from '@sentinel/hooks';
import { useState } from 'react';
import { toast } from 'sonner';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Department } from '@sentinel/shared/types';

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
import { EditDepartmentDialog } from '@/app/(protected)/departments/_components/dialogs/edit-department-dialog';

interface DepartmentActionsCellProps {
    department: Department;
}

export const DepartmentActionsCell = ({ department }: DepartmentActionsCellProps) => {
    const { hasPermission } = useActivePermissions();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const canUpdateDepartment = hasPermission('departments:update');
    const canDeleteDepartment = hasPermission('departments:delete');

    const deleteDepartment = useDeleteDepartmentMutation({
        onSuccess: () => {
            toast.success('Department deleted successfully');
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
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(department.id)}>
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canUpdateDepartment ? (
                        <DropdownMenuItem
                            onClick={() => {
                                if (
                                    department.isInherited &&
                                    !window.confirm(
                                        'Editing this inherited department creates a local override for the selected branch context.',
                                    )
                                ) {
                                    return;
                                }

                                setEditOpen(true);
                            }}
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Details
                        </DropdownMenuItem>
                    ) : null}
                    {canDeleteDepartment ? (
                        <DropdownMenuItem
                            onClick={() => setDeleteOpen(true)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Department
                        </DropdownMenuItem>
                    ) : null}
                </DropdownMenuContent>
            </DropdownMenu>

            {canUpdateDepartment ? (
                <EditDepartmentDialog
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    departmentToEdit={department}
                />
            ) : null}

            {canDeleteDepartment ? (
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent className="animate-none transition-none duration-0 data-[state=closed]:animate-none data-[state=open]:animate-none">
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the
                                department &quot;{department.name}&quot; and remove it from the
                                servers.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => deleteDepartment.mutate(department.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteDepartment.isPending}
                            >
                                {deleteDepartment.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
};
