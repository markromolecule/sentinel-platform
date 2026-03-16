"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Role } from "@sentinel/shared/mock-data";
import { 
    DataTableColumnHeader, 
    Button, 
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@sentinel/ui";
import { MoreHorizontal, Edit, Trash, ShieldCheck } from "lucide-react";
import { ManageRolePermissionsDialog } from "./manage-role-permissions-dialog";
import { useState } from "react";

export const roleColumns: ColumnDef<Role>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Role Name" />
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue("description")}</div>,
    },
    {
        accessorKey: "permissions",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Permissions Count" />
        ),
        cell: ({ row }) => {
            const permissions = row.getValue<string[]>("permissions");
            return <Badge variant="secondary">{permissions.length} Permissions</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <RoleActions role={row.original} />
    },
];

function RoleActions({ role }: { role: Role }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" /> Delete Role
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ManageRolePermissionsDialog 
                role={role} 
                open={open} 
                onOpenChange={setOpen} 
            />
        </>
    );
}
