'use client';

import { useState, useLayoutEffect, type ReactNode } from 'react';
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
import { Plus } from 'lucide-react';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AssignmentEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import { formatRoleLabel } from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

export function AssignmentManagerView({
    setActions,
}: {
    setActions?: (actions: ReactNode) => void;
}) {
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

    useLayoutEffect(() => {
        setActions?.(
            <Button
                onClick={() => setEditorOpen(true)}
                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
            >
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
            </Button>,
        );
        return () => setActions?.(null);
    }, [setActions]);

    const columns = useStableValue<ColumnDef<AccessControlAssignment>[]>(
        () => [
            {
                id: 'userSearch',
                accessorFn: (row) => `${row.userName} ${row.email}`,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="User Identity" />
                ),
                cell: ({ row }) => (
                    <div className="space-y-1 py-1">
                        <div className="text-foreground text-[14px] font-semibold">
                            {row.original.userName}
                        </div>
                        <div className="text-muted-foreground text-[12px] font-medium opacity-70">
                            {row.original.email}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'roleName',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Authorized Role" />
                ),
                cell: ({ row }) => (
                    <Badge
                        variant="secondary"
                        className="bg-primary/5 text-primary border-primary/10 h-6 rounded-none px-2 text-[11px] font-semibold"
                    >
                        {formatRoleLabel(row.original.roleName)}
                    </Badge>
                ),
            },
            {
                accessorKey: 'assignedAt',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Grant Date" />
                ),
                cell: ({ row }) => (
                    <div className="text-muted-foreground text-[12px] font-medium tracking-tight">
                        {row.original.assignedAt
                            ? new Date(row.original.assignedAt).toLocaleDateString(undefined, {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
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
        <>
            <DataTable
                columns={columns}
                data={assignableAssignments}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder="Search by user identity or email..."
                facets={roleFacets}
                rowClassName="bg-background hover:bg-muted/30 border-b border-muted/30 border-l-2 border-l-[#323d8f]/30 border border-[#323d8f]/10"
                emptyContent={
                    <AccessControlEmptyState
                        title="No Assignments"
                        description="There are currently no custom role assignments in this category. Use the action above to promote an account."
                        action={
                            <Button
                                variant="outline"
                                onClick={() => setEditorOpen(true)}
                                className="mt-4"
                            >
                                Create First Assignment
                            </Button>
                        }
                    />
                }
            />

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
        </>
    );
}
