"use client";

import { useDeleteDepartmentMutation } from "@/data";
import { useState } from "react";
import { toast } from "sonner";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Department } from "@sentinel/shared/types";

import { Button } from "@sentinel/ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@sentinel/ui";
import { EditDepartmentDialog } from "@/app/(protected)/(superadmin)/departments/_components/dialogs/edit-department-dialog";

interface DepartmentActionsCellProps {
    department: Department;
}

export const DepartmentActionsCell = ({ department }: DepartmentActionsCellProps) => {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const deleteDepartment = useDeleteDepartmentMutation({
        onSuccess: () => {
            toast.success('Department deleted successfully');
            setDeleteOpen(false);
        },
        onError: (error: Error) => toast.error(error.message)
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
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setDeleteOpen(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Department
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditDepartmentDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                departmentToEdit={department}
            />

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="animate-none data-[state=open]:animate-none data-[state=closed]:animate-none duration-0 transition-none">
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the department
                            &quot;{department.name}&quot; and remove it from the servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
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
        </>
    );
};
