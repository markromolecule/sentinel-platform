'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import type { AccessControlRole } from '@sentinel/shared/types';
import {
    DataTableColumnHeader,
    Button,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@sentinel/ui';
import { MoreHorizontal, Edit, Trash, ShieldCheck } from 'lucide-react';
import { useDeleteAccessControlRoleMutation } from '@sentinel/hooks';
import { toast } from 'sonner';
import { ManageRolePermissionsDialog } from './manage-role-permissions-dialog';
import { RoleFormDialog } from './role-form-dialog';

export const roleColumns: ColumnDef<AccessControlRole>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
        cell: ({ row }) => <div className="font-semibold text-sm">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => (
            <div className="text-muted-foreground text-sm max-w-sm truncate">
                {row.getValue('description') || 'No description provided.'}
            </div>
        ),
    },
    {
        accessorKey: 'permissionIds',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions Count" />,
        cell: ({ row }) => {
            const permissions = row.original.permissionIds || [];
            return (
                <Badge variant={permissions.length > 0 ? 'secondary' : 'outline'}>
                    {permissions.length} Permissions
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <RoleActions role={row.original} />,
    },
];

function RoleActions({ role }: { role: AccessControlRole }) {
    const [permissionsOpen, setPermissionsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const deleteMutation = useDeleteAccessControlRoleMutation({
        onSuccess: () => {
            toast.success(`Role "${role.name}" deleted successfully.`);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete role.');
        },
    });

    const handleDelete = () => {
        if (confirm(`Are you absolutely sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
            deleteMutation.mutate(role.id);
        }
    };

    const isPending = deleteMutation.isPending;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setPermissionsOpen(true)}>
                        <ShieldCheck className="mr-2 h-4 w-4" /> Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Role
                    </DropdownMenuItem>
                    {!role.isSystem && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete Role
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <ManageRolePermissionsDialog
                role={role}
                open={permissionsOpen}
                onOpenChange={setPermissionsOpen}
            />

            <RoleFormDialog
                role={role}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
