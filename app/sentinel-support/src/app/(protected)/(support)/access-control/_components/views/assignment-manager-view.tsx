'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    useAccessControlAssignmentsQuery,
    useAccessControlRolesQuery,
    useCreateAccessControlAssignmentMutation,
    useDebounce,
    useStableValue,
} from '@sentinel/hooks';
import { SUPPORT_ASSIGNABLE_ROLE_NAMES } from '@sentinel/shared/constants';
import type { AccessControlAssignment } from '@sentinel/shared/types';
import { Badge, Button, DataTable, DataTableColumnHeader } from '@sentinel/ui';
import { UserPlus } from 'lucide-react';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AssignmentEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import { formatRoleLabel } from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

export function AssignmentManagerView() {
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const {
        data: assignments = [],
        isLoading,
        error,
    } = useAccessControlAssignmentsQuery(debouncedSearchValue);

    const {
        data: roles = [],
        isLoading: isRolesLoading,
        error: rolesError,
    } = useAccessControlRolesQuery();

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



    const columns = useStableValue<ColumnDef<AccessControlAssignment>[]>(
        () => [
            {
                id: 'userSearch',
                accessorFn: (row) => `${row.userName} ${row.email}`,
                header: ({ column }) => <DataTableColumnHeader column={column} title="User Identity" />,
                cell: ({ row }) => (
                    <div className="space-y-1 py-1">
                        <div className="text-sm font-bold tracking-tight text-foreground/90 uppercase">
                            {row.original.userName}
                        </div>
                        <div className="text-muted-foreground text-[11px] font-medium opacity-70">
                            {row.original.email}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'roleName',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Authorized Role" />,
                cell: ({ row }) => (
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider">
                        {formatRoleLabel(row.original.roleName)}
                    </Badge>
                ),
            },
            {
                accessorKey: 'assignedAt',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Grant Date" />,
                cell: ({ row }) => (
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-tight">
                        {row.original.assignedAt
                            ? new Date(row.original.assignedAt).toLocaleDateString(undefined, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                            : 'Baseline'}
                    </div>
                ),
            },
        ],
        [],
    );

    const roleFacets = useStableValue(
        () => [
            {
                columnKey: 'roleName',
                title: 'Filter by Role',
                options: assignableRoles.map((role) => ({
                    label: formatRoleLabel(role.name),
                    value: role.name,
                })),
            },
        ],
        [assignableRoles],
    );

    const pageError = error || rolesError;
    const isBusy = isLoading || isRolesLoading;

    if (isBusy) return <AccessControlLoadingState label="Reviewing active links..." />;
    if (pageError) return <AccessControlErrorState message={pageError.message} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-foreground/90 uppercase opacity-80">
                        Active Assignments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                        User-level role elevation and administrative links.
                    </p>
                </div>
                <Button
                    onClick={() => setEditorOpen(true)}
                    className="gap-2 shadow-sm rounded-xl text-[10px] font-bold uppercase tracking-widest h-10"
                >
                    <UserPlus className="size-3.5" />
                    New Assignment
                </Button>
            </div>

            <div className="rounded-2xl border bg-card/20 shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={assignableAssignments}
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search by user identity or email..."
                    facets={roleFacets}
                    emptyContent={
                        <AccessControlEmptyState
                            title="No Assignments"
                            description="There are currently no custom role assignments in this category. Use the action above to promote an account."
                            action={
                                <Button variant="outline" onClick={() => setEditorOpen(true)} className="mt-4">
                                    Create First Assignment
                                </Button>
                            }
                        />
                    }
                />
            </div>

            <AssignmentEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                roles={assignableRoles}
                isPending={createAssignmentMutation.isPending}
                onSubmit={(payload) =>
                    createAssignmentMutation.mutate(payload, {
                        onSuccess: () => setEditorOpen(false),
                    })
                }
            />
        </div>
    );
}
