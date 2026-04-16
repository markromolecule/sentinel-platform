'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    useAccessControlAssignmentsQuery,
    useAccessControlRolesQuery,
    useCreateAccessControlAssignmentMutation,
    useStableValue,
    useUsersQuery,
} from '@sentinel/hooks';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';
import type { AccessControlAssignment } from '@sentinel/shared/types';
import { Button, DataTable, DataTableColumnHeader } from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
    AssignmentEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import { formatRoleLabel } from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

export default function AccessControlAssignmentsPage() {
    const { data: assignments = [], isLoading, error } = useAccessControlAssignmentsQuery();
    const {
        data: roles = [],
        isLoading: isRolesLoading,
        error: rolesError,
    } = useAccessControlRolesQuery();
    const {
        data: assignableUsersResponse = [],
        isLoading: isAssignableUsersLoading,
        error: assignableUsersError,
    } = useUsersQuery({
        limit: 300,
        role: [...SUPPORT_ASSIGNABLE_ROLE_NAMES],
    });

    const createAssignmentMutation = useCreateAccessControlAssignmentMutation();

    const [editorOpen, setEditorOpen] = useState(false);

    const assignableRoles = useStableValue(
        () =>
            roles.filter((role) =>
                SUPPORT_ASSIGNABLE_ROLE_NAMES.includes(
                    role.name as (typeof SUPPORT_ASSIGNABLE_ROLE_NAMES)[number],
                ),
            ),
        [roles],
    );

    const assignableAssignments = useStableValue(
        () =>
            assignments.filter((assignment) =>
                SUPPORT_ASSIGNABLE_ROLE_NAMES.includes(
                    assignment.roleName as (typeof SUPPORT_ASSIGNABLE_ROLE_NAMES)[number],
                ),
            ),
        [assignments],
    );

    const assignableUsers = useStableValue(() => {
        const seenUserIds = new Set<string>();

        return assignableUsersResponse.filter((user) => {
            if (
                !SUPPORT_ASSIGNABLE_ROLE_NAMES.includes(
                    user.role as (typeof SUPPORT_ASSIGNABLE_ROLE_NAMES)[number],
                )
            ) {
                return false;
            }

            if (seenUserIds.has(user.id)) {
                return false;
            }

            seenUserIds.add(user.id);
            return true;
        });
    }, [assignableUsersResponse]);

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
                    <span className="text-sm font-medium">
                        {formatRoleLabel(row.original.roleName)}
                    </span>
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
        ],
        [],
    );

    const roleFacets = useStableValue(
        () => [
            {
                columnKey: 'roleName',
                title: 'Role',
                options: assignableRoles.map((role) => ({
                    label: formatRoleLabel(role.name),
                    value: role.name,
                })),
            },
        ],
        [assignableRoles],
    );

    const pageError = error || rolesError || assignableUsersError;
    const isBusy = isLoading || isRolesLoading || isAssignableUsersLoading;

    return (
        <AccessControlPageShell
            title="Assignments"
            description="Promote superadmin, admin, and instructor accounts by reassigning their primary role."
            actions={<Button onClick={() => setEditorOpen(true)}>New assignment</Button>}
        >
            {isBusy ? (
                <AccessControlLoadingState label="Loading assignments, roles, and users..." />
            ) : pageError ? (
                <AccessControlErrorState message={pageError.message} />
            ) : (
                <DataTable
                    columns={columns}
                    data={assignableAssignments}
                    searchKey="userSearch"
                    searchPlaceholder="Search by name or email..."
                    facets={roleFacets}
                    emptyContent={
                        <AccessControlEmptyState
                            title="No assignments found"
                            description="Create the first promotion assignment for a superadmin, admin, or instructor account."
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
                roles={assignableRoles}
                users={assignableUsers}
                isPending={createAssignmentMutation.isPending}
                onSubmit={(payload) =>
                    createAssignmentMutation.mutate(payload, {
                        onSuccess: () => setEditorOpen(false),
                    })
                }
            />
        </AccessControlPageShell>
    );
}
