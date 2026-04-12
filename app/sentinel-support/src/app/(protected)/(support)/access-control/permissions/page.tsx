'use client';

import { useState } from 'react';
import {
    useAccessControlPermissionsQuery,
    useCreateAccessControlPermissionMutation,
    useDeleteAccessControlPermissionMutation,
    useStableValue,
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
    Button,
    SearchBar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    AccessControlPageShell,
    PermissionEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import {
    formatActionLabel,
    formatModuleLabel,
    getPermissionCategoryLabel,
    getPermissionScopeLabel,
    groupPermissionsByCategoryAndModule,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';

function matchesPermissionSearch(permission: AccessControlPermission, searchValue: string) {
    const searchTokens = searchValue.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (searchTokens.length === 0) {
        return true;
    }

    const haystack = [
        permission.name,
        permission.key,
        permission.description,
        permission.moduleKey,
        permission.actionKey,
        permission.category,
        permission.scope,
        formatModuleLabel(permission.moduleKey),
        formatActionLabel(permission.actionKey),
        getPermissionCategoryLabel(permission.category),
        getPermissionScopeLabel(permission.scope),
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return searchTokens.every((token) => haystack.includes(token));
}

export default function AccessControlPermissionsPage() {
    const { data: permissions = [], isLoading, error } = useAccessControlPermissionsQuery();
    const createPermissionMutation = useCreateAccessControlPermissionMutation();
    const updatePermissionMutation = useUpdateAccessControlPermissionMutation();
    const deletePermissionMutation = useDeleteAccessControlPermissionMutation();

    const [editorOpen, setEditorOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedPermission, setSelectedPermission] = useState<AccessControlPermission | null>(
        null,
    );
    const [permissionToDelete, setPermissionToDelete] = useState<AccessControlPermission | null>(
        null,
    );
    const [collapsedCategoryKeys, setCollapsedCategoryKeys] = useState<Record<string, boolean>>({});
    const [collapsedModuleKeys, setCollapsedModuleKeys] = useState<Record<string, boolean>>({});

    const filteredPermissions = useStableValue(
        () =>
            permissions.filter((permission) =>
                matchesPermissionSearch(permission, searchValue),
            ),
        [permissions, searchValue],
    );

    const groupedPermissions = useStableValue(
        () => groupPermissionsByCategoryAndModule(filteredPermissions),
        [filteredPermissions],
    );

    const systemPermissionCount = useStableValue(
        () => filteredPermissions.filter((permission) => permission.isSystem).length,
        [filteredPermissions],
    );

    const toggleCategory = (categoryKey: string) => {
        setCollapsedCategoryKeys((current) => ({
            ...current,
            [categoryKey]: !current[categoryKey],
        }));
    };

    const toggleModule = (moduleKey: string) => {
        setCollapsedModuleKeys((current) => ({
            ...current,
            [moduleKey]: !current[moduleKey],
        }));
    };

    return (
        <AccessControlPageShell
            title="Permissions"
            description="Manage the permission registry in one place. Search the catalog, review the grouped list, and edit entries inline."
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
            ) : permissions.length === 0 ? (
                <AccessControlEmptyState
                    title="No permissions found"
                    description="Create the first permission to start building the registry."
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
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <SearchBar
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder="Search permission, module, action, or key..."
                                containerClassName="w-full sm:w-[360px]"
                            />
                            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                                <span>{filteredPermissions.length} visible permissions</span>
                                <span>{systemPermissionCount} system</span>
                                <span>
                                    {filteredPermissions.length - systemPermissionCount} custom
                                </span>
                            </div>
                        </div>

                        {searchValue ? (
                            <Button variant="ghost" size="sm" onClick={() => setSearchValue('')}>
                                Clear search
                            </Button>
                        ) : null}
                    </div>

                    {filteredPermissions.length === 0 ? (
                        <AccessControlEmptyState
                            title="No matching permissions"
                            description="Try a broader search term or clear the current filter."
                            action={
                                <Button variant="outline" onClick={() => setSearchValue('')}>
                                    Clear search
                                </Button>
                            }
                        />
                    ) : (
                        <div
                            data-lenis-prevent
                            className="max-h-[calc(100svh-18rem)] min-h-[28rem] overflow-auto overscroll-contain border-y"
                        >
                            <Table className="min-w-[980px] table-fixed">
                                <TableHeader>
                                    <TableRow className="bg-background hover:bg-background">
                                        <TableHead className="bg-background sticky top-0 z-20 w-[42%] whitespace-normal">
                                            Permission
                                        </TableHead>
                                        <TableHead className="bg-background sticky top-0 z-20 w-[12%] whitespace-normal">
                                            Action
                                        </TableHead>
                                        <TableHead className="bg-background sticky top-0 z-20 w-[12%] whitespace-normal">
                                            Scope
                                        </TableHead>
                                        <TableHead className="bg-background sticky top-0 z-20 w-[10%] whitespace-normal">
                                            Type
                                        </TableHead>
                                        <TableHead className="bg-background sticky top-0 z-20 w-[12%] whitespace-normal">
                                            Used by
                                        </TableHead>
                                        <TableHead className="bg-background sticky top-0 z-20 w-[12%] text-right whitespace-normal">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {groupedPermissions.flatMap((category) => {
                                        const categoryKey = category.categoryKey ?? '__other__';
                                        const isCategoryCollapsed =
                                            collapsedCategoryKeys[categoryKey] ?? true;
                                        const categoryPermissionCount = category.modules.reduce(
                                            (sum, module) => sum + module.permissions.length,
                                            0,
                                        );

                                        return [
                                            <TableRow
                                                key={`category-${categoryKey}`}
                                                className="bg-muted/30 hover:bg-muted/30"
                                            >
                                                <TableCell colSpan={6} className="p-0">
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                                                        onClick={() => toggleCategory(categoryKey)}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            {isCategoryCollapsed ? (
                                                                <ChevronRight className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                            <span className="font-semibold">
                                                                {category.categoryLabel}
                                                            </span>
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {categoryPermissionCount} permissions
                                                        </span>
                                                    </button>
                                                </TableCell>
                                            </TableRow>,
                                            ...(!isCategoryCollapsed
                                                ? category.modules.flatMap((module) => {
                                                      const moduleKey = `${categoryKey}:${module.moduleKey}`;
                                                      const isModuleCollapsed =
                                                          collapsedModuleKeys[moduleKey] ?? true;

                                                      return [
                                                          <TableRow
                                                              key={`module-${moduleKey}`}
                                                              className="bg-muted/10 hover:bg-muted/10"
                                                          >
                                                              <TableCell colSpan={6} className="p-0">
                                                                  <button
                                                                      type="button"
                                                                      className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left"
                                                                      onClick={() =>
                                                                          toggleModule(moduleKey)
                                                                      }
                                                                  >
                                                                      <span className="flex items-start gap-3">
                                                                          {isModuleCollapsed ? (
                                                                              <ChevronRight className="mt-0.5 h-4 w-4" />
                                                                          ) : (
                                                                              <ChevronDown className="mt-0.5 h-4 w-4" />
                                                                          )}
                                                                          <span className="space-y-1">
                                                                              <span className="block font-medium">
                                                                                  {module.moduleLabel}
                                                                              </span>
                                                                              <span className="text-muted-foreground block text-sm">
                                                                                  {module.helperText}
                                                                              </span>
                                                                          </span>
                                                                      </span>
                                                                      <span className="text-muted-foreground text-xs">
                                                                          {module.permissions.length}{' '}
                                                                          permissions
                                                                      </span>
                                                                  </button>
                                                              </TableCell>
                                                          </TableRow>,
                                                          ...(!isModuleCollapsed
                                                              ? module.permissions.map(
                                                                    (permission) => (
                                                                        <TableRow key={permission.id}>
                                                                            <TableCell className="align-top whitespace-normal">
                                                                                <div className="space-y-1.5 pr-4">
                                                                                    <div className="font-medium">
                                                                                        {permission.name}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground text-sm">
                                                                                        {permission.description ||
                                                                                            'No description has been recorded for this permission yet.'}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground text-xs break-all">
                                                                                        {permission.key}
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="align-top whitespace-normal">
                                                                                {formatActionLabel(
                                                                                    permission.actionKey,
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell className="align-top whitespace-normal">
                                                                                {getPermissionScopeLabel(
                                                                                    permission.scope,
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell className="align-top whitespace-normal">
                                                                                {permission.isSystem
                                                                                    ? 'System'
                                                                                    : 'Custom'}
                                                                            </TableCell>
                                                                            <TableCell className="align-top whitespace-normal">
                                                                                <div className="space-y-1">
                                                                                    <div>
                                                                                        {permission.roleCount}{' '}
                                                                                        roles
                                                                                    </div>
                                                                                    <div className="text-muted-foreground text-xs">
                                                                                        {
                                                                                            permission.overrideCount
                                                                                        }{' '}
                                                                                        overrides
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="align-top">
                                                                                <div className="flex justify-end gap-2">
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            setSelectedPermission(
                                                                                                permission,
                                                                                            );
                                                                                            setEditorOpen(
                                                                                                true,
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        Edit
                                                                                    </Button>
                                                                                    {!permission.isSystem ? (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            className="text-destructive"
                                                                                            onClick={() =>
                                                                                                setPermissionToDelete(
                                                                                                    permission,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Delete
                                                                                        </Button>
                                                                                    ) : null}
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ),
                                                                )
                                                              : []),
                                                      ];
                                                  })
                                                : []),
                                        ];
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
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
                            { permissionId: selectedPermission.id, payload },
                            {
                                onSuccess: () => {
                                    setEditorOpen(false);
                                },
                            },
                        );
                        return;
                    }

                    createPermissionMutation.mutate(payload, {
                        onSuccess: () => {
                            setEditorOpen(false);
                        },
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
                            This permanently removes{' '}
                            <strong>{permissionToDelete?.name}</strong> from the registry.
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
