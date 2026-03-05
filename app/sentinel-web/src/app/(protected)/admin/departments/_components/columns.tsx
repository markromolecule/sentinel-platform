"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Department } from "@sentinel/shared/types";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteDepartmentMutation } from "@/hooks/query/departments/use-delete-department-mutation";
import { useState } from "react";
import { toast } from "sonner";
import { AddDepartmentDialog } from "./add-department-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


function formatDate(value: Date | string | null | undefined): string {
    if (!value) return "—";
    try {
        const d = typeof value === "string" ? parseISO(value) : value;
        return isValid(d) ? format(d, "MMM d, yyyy") : "—";
    } catch {
        return "—";
    }
}

// Separate component to handle hooks used in cells
const DepartmentActionsCell = ({ department }: { department: Department }) => {
    const deleteDepartment = useDeleteDepartmentMutation({
        onSuccess: () => toast.success('Department deleted successfully'),
        onError: (error: Error) => toast.error(error.message)
    });
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

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

            <AddDepartmentDialog
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
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

// columns for the data table
export const columns: ColumnDef<Department>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("code") || "N/A"}</div>,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Department Name" />
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: () => <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700">Active</Badge>
    },
    {
        accessorKey: "createdBy",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created By" />
        ),
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("createdBy") || "System"}</div>
    },
    {
        accessorKey: "updatedBy",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated By" />
        ),
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("updatedBy") || "—"}</div>
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {formatDate(row.getValue("createdAt"))}
            </div>
        ),
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Updated At" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {formatDate(row.getValue("updatedAt"))}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <DepartmentActionsCell department={row.original} />
    },
];
