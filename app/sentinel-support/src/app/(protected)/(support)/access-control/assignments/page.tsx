'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    useAccessControlAssignmentsQuery,
    useAccessControlRolesQuery,
    useCreateAccessControlAssignmentMutation,
    useDeleteAccessControlAssignmentMutation,
    useStableValue,
    useUsersQuery,
} from '@sentinel/hooks';
import type { AccessControlAssignment } from '@sentinel/shared/types';
import {
    Button,
    DataTable,
    DataTableColumnHeader,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
    AssignmentEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';

export default function AccessControlAssignmentsPage() {
    const { data: assignments = [], isLoading, error } = useAccessControlAssignmentsQuery();
    const {
        data: roles = [],
        isLoading: isRolesLoading,
        error: rolesError,
    } = useAccessControlRolesQuery();
    const {
        data: users = [],
        isLoading: isUsersLoading,
        error: usersError,
    } = useUsersQuery({
        limit: 200,
    });

    const createAssignmentMutation = useCreateAccessControlAssignmentMutation();
    const deleteAssignmentMutation = useDeleteAccessControlAssignmentMutation();

    const [editorOpen, setEditorOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<AccessControlAssignment | null>(
        null,
    );

    const columns = useStableValue<ColumnDef<AccessControlAssignment>[]>(
        () => [
            {
                id: 'userSearch',
                accessorFn: (row) => `${row.userName} ${row.email}`,
                header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="font-medium">{row.original.userName}</div>
                        <div className="text-muted-foreground text-sm">{row.original.email}</div>
                    </div>
                ),
            },
            {
                accessorKey: 'roleName',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
                cell: ({ row }) => (
                    <span className="text-sm font-medium">{row.original.roleName}</span>
                ),
            },
            {
                accessorKey: 'assignedAt',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned" />,
                cell: ({ row }) =>
                    row.original.assignedAt
                        ? new Date(row.original.assignedAt).toLocaleString()
                        : 'No timestamp',
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setAssignmentToDelete(row.original)}
                        >
                            Remove
                        </Button>
                    </div>
                ),
            },
        ],
        [setAssignmentToDelete],
    );

    const roleFacets = useStableValue(
        () => [
            {
                columnKey: 'roleName',
                title: 'Role',
                options: roles.map((role) => ({ label: role.name, value: role.name })),
            },
        ],
        [roles],
    );

    const pageError = error || rolesError || usersError;
    const isBusy = isLoading || isRolesLoading || isUsersLoading;

    return (
        <AccessControlPageShell
            title="Assignments"
            description="Manage which users inherit which roles, with a cleaner assignment flow for support operations."
            actions={<Button onClick={() => setEditorOpen(true)}>New assignment</Button>}
        >
            {isBusy ? (
                <AccessControlLoadingState label="Loading assignments, roles, and users..." />
            ) : pageError ? (
                <AccessControlErrorState message={pageError.message} />
            ) : (
                <DataTable
                    columns={columns}
                    data={assignments}
                    searchKey="userSearch"
                    searchPlaceholder="Search by name or email..."
                    facets={roleFacets}
                    emptyContent={
                        <AccessControlEmptyState
                            title="No assignments found"
                            description="Create the first assignment to connect a user with a role."
                            action={
                                <Button onClick={() => setEditorOpen(true)}>
                                    Create assignment
                                </Button>
                            }
                        />
                    }
                />
            )}

            <AssignmentEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                roles={roles}
                users={users}
                isPending={createAssignmentMutation.isPending}
                onSubmit={(payload) =>
                    createAssignmentMutation.mutate(payload, {
                        onSuccess: () => setEditorOpen(false),
                    })
                }
            />

            <AlertDialog
                open={Boolean(assignmentToDelete)}
                onOpenChange={(open) => !open && setAssignmentToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the role <strong>{assignmentToDelete?.roleName}</strong>{' '}
                            from <strong>{assignmentToDelete?.userName}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteAssignmentMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(event) => {
                                event.preventDefault();
                                if (!assignmentToDelete) return;

                                deleteAssignmentMutation.mutate(
                                    {
                                        userId: assignmentToDelete.userId,
                                        roleId: assignmentToDelete.roleId,
                                    },
                                    { onSuccess: () => setAssignmentToDelete(null) },
                                );
                            }}
                            disabled={deleteAssignmentMutation.isPending}
                        >
                            {deleteAssignmentMutation.isPending
                                ? 'Removing...'
                                : 'Remove assignment'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AccessControlPageShell>
    );
}
