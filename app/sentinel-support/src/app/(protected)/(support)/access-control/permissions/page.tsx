'use client';

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    useAccessControlPermissionsQuery,
    useCreateAccessControlPermissionMutation,
    useDeleteAccessControlPermissionMutation,
    useUpdateAccessControlPermissionMutation,
} from '@sentinel/hooks';
import type { AccessControlPermission } from '@sentinel/shared/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    DataTable,
    DataTableColumnHeader,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlGuideTable,
    AccessControlLoadingState,
    AccessControlMetricStrip,
    AccessControlPageShell,
    AccessControlSection,
    PermissionEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import {
    formatActionLabel,
    formatModuleLabel,
    getActionSortIndex,
    getModuleSortIndex,
    getPermissionCategoryLabel,
    getPermissionScopeLabel,
    mapActionKeyToCrudBucket,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

function summarizeList(values: string[]) {
    if (values.length === 0) {
        return 'None';
    }

    if (values.length <= 3) {
        return values.join(', ');
    }

    return `${values.slice(0, 3).join(', ')} +${values.length - 3} more`;
}

export default function AccessControlPermissionsPage() {
    const { data: permissions = [], isLoading, error } = useAccessControlPermissionsQuery();
    const createPermissionMutation = useCreateAccessControlPermissionMutation();
    const updatePermissionMutation = useUpdateAccessControlPermissionMutation();
    const deletePermissionMutation = useDeleteAccessControlPermissionMutation();

    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<AccessControlPermission | null>(
        null,
    );
    const [permissionToDelete, setPermissionToDelete] = useState<AccessControlPermission | null>(
        null,
    );

    const sortedPermissions = useMemo(
        () =>
            [...permissions].sort(
                (left, right) =>
                    getModuleSortIndex(left.moduleKey) - getModuleSortIndex(right.moduleKey) ||
                    left.moduleKey.localeCompare(right.moduleKey) ||
                    getActionSortIndex(left.actionKey) - getActionSortIndex(right.actionKey) ||
                    left.actionKey.localeCompare(right.actionKey) ||
                    left.name.localeCompare(right.name),
            ),
        [permissions],
    );

    const moduleRollup = useMemo(() => {
        const moduleMap = new Map<
            string,
            {
                moduleKey: string;
                categories: Set<string>;
                actions: Set<string>;
                permissionCount: number;
                systemCount: number;
                customCount: number;
                roleCount: number;
                overrideCount: number;
            }
        >();

        for (const permission of sortedPermissions) {
            const current = moduleMap.get(permission.moduleKey) ?? {
                moduleKey: permission.moduleKey,
                categories: new Set<string>(),
                actions: new Set<string>(),
                permissionCount: 0,
                systemCount: 0,
                customCount: 0,
                roleCount: 0,
                overrideCount: 0,
            };

            current.categories.add(getPermissionCategoryLabel(permission.category));
            current.actions.add(formatActionLabel(permission.actionKey));
            current.permissionCount += 1;
            current.systemCount += permission.isSystem ? 1 : 0;
            current.customCount += permission.isSystem ? 0 : 1;
            current.roleCount += permission.roleCount;
            current.overrideCount += permission.overrideCount;

            moduleMap.set(permission.moduleKey, current);
        }

        return Array.from(moduleMap.values()).sort(
            (left, right) =>
                getModuleSortIndex(left.moduleKey) - getModuleSortIndex(right.moduleKey) ||
                left.moduleKey.localeCompare(right.moduleKey),
        );
    }, [sortedPermissions]);

    const columns = useMemo<ColumnDef<AccessControlPermission>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Permission" />
                ),
                cell: ({ row }) => {
                    const permission = row.original;
                    return (
                        <div className="space-y-1 break-words whitespace-normal">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium">{permission.name}</div>
                                <Badge variant="outline">
                                    {mapActionKeyToCrudBucket(permission.actionKey).toUpperCase()}
                                </Badge>
                            </div>
                            <div className="text-muted-foreground text-xs break-all">
                                {permission.key}
                            </div>
                            <div className="text-muted-foreground max-w-md text-sm">
                                {permission.description || 'No description recorded yet.'}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'moduleKey',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Module" />,
                cell: ({ row }) => formatModuleLabel(row.original.moduleKey),
            },
            {
                accessorKey: 'category',
                accessorFn: (row) => row.category?.trim() || 'other',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
                cell: ({ row }) => getPermissionCategoryLabel(row.original.category),
            },
            {
                id: 'area',
                accessorFn: (row) =>
                    `${formatModuleLabel(row.moduleKey)} ${getPermissionCategoryLabel(row.category)}`,
                header: ({ column }) => <DataTableColumnHeader column={column} title="Area" />,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div>{formatModuleLabel(row.original.moduleKey)}</div>
                        <div className="text-muted-foreground text-xs">
                            {getPermissionCategoryLabel(row.original.category)}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'actionKey',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />,
                cell: ({ row }) => formatActionLabel(row.original.actionKey),
            },
            {
                accessorKey: 'scope',
                accessorFn: (row) => row.scope || 'global',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Scope" />,
                cell: ({ row }) => getPermissionScopeLabel(row.original.scope),
            },
            {
                id: 'usage',
                accessorFn: (row) => `${row.roleCount}-${row.overrideCount}`,
                header: ({ column }) => <DataTableColumnHeader column={column} title="Used by" />,
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div className="text-sm font-medium">{row.original.roleCount} roles</div>
                        <div className="text-muted-foreground text-xs">
                            {row.original.overrideCount} overrides
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'permissionType',
                accessorFn: (row) => (row.isSystem ? 'system' : 'custom'),
                header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
                cell: ({ row }) => (
                    <Badge variant="outline">{row.original.isSystem ? 'System' : 'Custom'}</Badge>
                ),
            },
            {
                accessorKey: 'updatedAt',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
                cell: ({ row }) =>
                    row.original.updatedAt
                        ? new Date(row.original.updatedAt).toLocaleDateString()
                        : 'Not updated',
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const permission = row.original;

                    return (
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedPermission(permission);
                                    setEditorOpen(true);
                                }}
                            >
                                Edit
                            </Button>
                            {!permission.isSystem ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => setPermissionToDelete(permission)}
                                >
                                    Delete
                                </Button>
                            ) : null}
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const facets = [
        {
            columnKey: 'permissionType',
            title: 'Type',
            options: [
                { label: 'System permission', value: 'system' },
                { label: 'Custom permission', value: 'custom' },
            ],
        },
        {
            columnKey: 'moduleKey',
            title: 'Module',
            options: Array.from(
                new Set(sortedPermissions.map((permission) => permission.moduleKey)),
            )
                .sort(
                    (left, right) =>
                        getModuleSortIndex(left) - getModuleSortIndex(right) ||
                        left.localeCompare(right),
                )
                .map((moduleKey) => ({ label: formatModuleLabel(moduleKey), value: moduleKey })),
        },
        {
            columnKey: 'category',
            title: 'Category',
            options: Array.from(
                new Set(
                    sortedPermissions.map((permission) => permission.category?.trim() || 'other'),
                ),
            )
                .sort((left, right) =>
                    getPermissionCategoryLabel(left).localeCompare(
                        getPermissionCategoryLabel(right),
                    ),
                )
                .map((categoryKey) => ({
                    label: getPermissionCategoryLabel(categoryKey === 'other' ? null : categoryKey),
                    value: categoryKey,
                })),
        },
        {
            columnKey: 'scope',
            title: 'Scope',
            options: Array.from(
                new Set(sortedPermissions.map((permission) => permission.scope || 'global')),
            )
                .sort()
                .map((scope) => ({
                    label: getPermissionScopeLabel(scope),
                    value: scope,
                })),
        },
    ];

    const totalRoleLinks = sortedPermissions.reduce(
        (sum, permission) => sum + permission.roleCount,
        0,
    );
    const totalOverrides = sortedPermissions.reduce(
        (sum, permission) => sum + permission.overrideCount,
        0,
    );

    return (
        <AccessControlPageShell
            title="Permissions"
            description="Permissions are the building blocks roles can receive. Create or edit the catalog here, then assign those permissions on the Roles page."
            actions={
                <Button
                    onClick={() => {
                        setSelectedPermission(null);
                        setEditorOpen(true);
                    }}
                >
                    New permission
                </Button>
            }
        >
            {isLoading ? (
                <AccessControlLoadingState label="Loading permission catalog..." />
            ) : error ? (
                <AccessControlErrorState message={error.message} />
            ) : (
                <div className="space-y-6">
                    <AccessControlMetricStrip
                        items={[
                            {
                                label: 'Permissions',
                                value: sortedPermissions.length,
                                hint: 'Each record is a single action that can be granted to roles.',
                            },
                            {
                                label: 'System',
                                value: sortedPermissions.filter((permission) => permission.isSystem)
                                    .length,
                                hint: 'Built-in permissions supplied by the platform.',
                            },
                            {
                                label: 'Role Links',
                                value: totalRoleLinks,
                                hint: 'How many times permissions are currently granted to roles.',
                            },
                            {
                                label: 'Overrides',
                                value: totalOverrides,
                                hint: 'User-level exceptions stored outside normal role grants.',
                            },
                        ]}
                    />

                    <AccessControlSection
                        title="How Permissions Work"
                        description="Permissions define the smallest unit of access. Roles are built from these permission records."
                    >
                        <AccessControlGuideTable
                            items={[
                                {
                                    step: '1. Define the permission',
                                    title: 'Create a permission for one clear action',
                                    detail: 'A permission should describe one thing a user can do, such as view reports or update exam settings.',
                                },
                                {
                                    step: '2. Place it in the right area',
                                    title: 'Choose its module, category, and scope',
                                    detail: 'These fields keep the catalog organized so support can find the permission later and understand where it belongs.',
                                },
                                {
                                    step: '3. Grant it through roles',
                                    title: 'Open the Roles page to assign it',
                                    detail: 'Permissions are created here, but users receive them through roles. After you add a permission, grant it on the Roles page.',
                                },
                            ]}
                        />
                    </AccessControlSection>

                    <AccessControlSection
                        title="1. Permission Catalog"
                        description="Start here when you need to add, edit, or review the building blocks used by roles."
                    >
                        <div
                            data-lenis-prevent
                            className="[&_table]:min-w-[1120px] [&_table]:table-fixed [&_td]:align-top [&_td]:whitespace-normal [&_th]:whitespace-normal"
                        >
                            <DataTable
                                columns={columns}
                                data={sortedPermissions}
                                searchKey="name"
                                searchPlaceholder="Search permissions..."
                                facets={facets}
                                initialColumnVisibility={{
                                    moduleKey: false,
                                    category: false,
                                }}
                                emptyContent={
                                    <AccessControlEmptyState
                                        title="No permissions found"
                                        description="Create the first permission to begin defining RBAC coverage."
                                        action={
                                            <Button
                                                onClick={() => {
                                                    setSelectedPermission(null);
                                                    setEditorOpen(true);
                                                }}
                                            >
                                                Create first permission
                                            </Button>
                                        }
                                    />
                                }
                            />
                        </div>
                    </AccessControlSection>

                    <AccessControlSection
                        title="2. Coverage by Area"
                        description="Use this summary to see which modules already have dense permission coverage and which ones still look thin."
                    >
                        <div data-lenis-prevent className="overflow-x-auto">
                            <Table className="min-w-[920px] table-fixed">
                                <TableHeader>
                                    <TableRow className="bg-background hover:bg-background">
                                        <TableHead className="w-[16%] whitespace-normal">
                                            Module
                                        </TableHead>
                                        <TableHead className="w-[22%] whitespace-normal">
                                            Categories
                                        </TableHead>
                                        <TableHead className="w-[22%] whitespace-normal">
                                            Actions
                                        </TableHead>
                                        <TableHead className="w-[10%] whitespace-normal">
                                            Records
                                        </TableHead>
                                        <TableHead className="w-[15%] whitespace-normal">
                                            Types
                                        </TableHead>
                                        <TableHead className="w-[15%] whitespace-normal">
                                            Used by
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {moduleRollup.length > 0 ? (
                                        moduleRollup.map((module) => (
                                            <TableRow key={module.moduleKey}>
                                                <TableCell className="align-top font-medium break-words whitespace-normal">
                                                    {formatModuleLabel(module.moduleKey)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground align-top text-sm break-words whitespace-normal">
                                                    {summarizeList(
                                                        [...module.categories].sort((left, right) =>
                                                            left.localeCompare(right),
                                                        ),
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground align-top text-sm break-words whitespace-normal">
                                                    {summarizeList(
                                                        [...module.actions].sort((left, right) =>
                                                            left.localeCompare(right),
                                                        ),
                                                    )}
                                                </TableCell>
                                                <TableCell className="align-top whitespace-normal">
                                                    {module.permissionCount}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground align-top text-sm break-words whitespace-normal">
                                                    {module.systemCount} system,{' '}
                                                    {module.customCount} custom
                                                </TableCell>
                                                <TableCell className="text-muted-foreground align-top text-sm break-words whitespace-normal">
                                                    {module.roleCount} role links,{' '}
                                                    {module.overrideCount} overrides
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell
                                                colSpan={6}
                                                className="text-muted-foreground px-6 py-12 text-center text-sm"
                                            >
                                                No module coverage available yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </AccessControlSection>
                </div>
            )}

            <PermissionEditorDialog
                open={editorOpen}
                onOpenChange={setEditorOpen}
                permission={selectedPermission}
                isPending={createPermissionMutation.isPending || updatePermissionMutation.isPending}
                onSubmit={(payload) => {
                    if (selectedPermission) {
                        updatePermissionMutation.mutate(
                            {
                                permissionId: selectedPermission.id,
                                payload,
                            },
                            { onSuccess: () => setEditorOpen(false) },
                        );
                        return;
                    }

                    createPermissionMutation.mutate(payload, {
                        onSuccess: () => setEditorOpen(false),
                    });
                }}
            />

            <AlertDialog
                open={Boolean(permissionToDelete)}
                onOpenChange={(open) => !open && setPermissionToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete permission</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes <strong>{permissionToDelete?.name}</strong> from the RBAC
                            catalog and may affect roles that currently depend on it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletePermissionMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(event) => {
                                event.preventDefault();
                                if (!permissionToDelete) return;

                                deletePermissionMutation.mutate(permissionToDelete.id, {
                                    onSuccess: () => setPermissionToDelete(null),
                                });
                            }}
                            disabled={deletePermissionMutation.isPending}
                        >
                            {deletePermissionMutation.isPending
                                ? 'Deleting...'
                                : 'Delete permission'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AccessControlPageShell>
    );
}
