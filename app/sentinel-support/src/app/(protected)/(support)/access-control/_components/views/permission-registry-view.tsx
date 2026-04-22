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
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import { ChevronDown, Plus } from 'lucide-react';
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    PermissionEditorDialog,
} from '@/app/(protected)/(support)/access-control/_components';
import {
    formatActionLabel,
    formatModuleLabel,
    getPermissionCategoryLabel,
    getPermissionScopeLabel,
    groupPermissionsByCategoryAndModule,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';
import {
    PermissionCategoryRow,
    PermissionDataRow,
    PermissionModuleRow,
} from '../permission-table-components';

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

export function PermissionRegistryView() {
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
        () => permissions.filter((permission) => matchesPermissionSearch(permission, searchValue)),
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

    if (isLoading) return <AccessControlLoadingState label="Indexing registry..." />;
    if (error) return <AccessControlErrorState message={error.message} />;
    
    if (permissions.length === 0) {
        return (
            <AccessControlEmptyState
                title="Empty Registry"
                description="No permissions have been defined yet. Start by creating a system or custom permission baseline."
                action={
                    <Button
                        onClick={() => {
                            setSelectedPermission(null);
                            setEditorOpen(true);
                        }}
                    >
                        Create First Permission
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search by key, action, or module..."
                        containerClassName="w-full sm:max-w-md"
                        className="h-11 rounded-xl border-muted-foreground/20 bg-background/50 focus-visible:ring-primary/20"
                    />
                    <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary" />
                            <span>{filteredPermissions.length} Results</span>
                        </div>
                        <div className="size-1 rounded-full bg-muted-foreground/30" />
                        <span>{systemPermissionCount} System</span>
                        <div className="size-1 rounded-full bg-muted-foreground/30" />
                        <span>{filteredPermissions.length - systemPermissionCount} Custom</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {searchValue && (
                        <Button variant="ghost" size="sm" onClick={() => setSearchValue('')} className="text-xs font-bold text-muted-foreground hover:text-foreground">
                            Reset Filter
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => {
                            setSelectedPermission(null);
                            setEditorOpen(true);
                        }}
                        className="gap-2 shadow-sm rounded-xl text-[10px] font-bold uppercase tracking-widest h-10"
                    >
                        <Plus className="size-3.5" />
                        New Permission
                    </Button>
                </div>
            </div>

            {filteredPermissions.length === 0 ? (
                <div className="rounded-2xl border border-dashed py-20 text-center">
                    <AccessControlEmptyState
                        title="No Matches"
                        description="We couldn't find any permissions matching your current search criteria."
                        action={
                            <Button variant="outline" onClick={() => setSearchValue('')} className="mt-4">
                                Clear Search
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="rounded-2xl border bg-card/20 overflow-hidden shadow-sm">
                    <div className="max-h-[calc(100vh-25rem)] min-h-[32rem] overflow-auto overscroll-contain border-y">
                        <Table className="min-w-[1020px] table-fixed">
                            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="w-[40%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-6">Permission & Context</TableHead>
                                    <TableHead className="w-[12%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Action</TableHead>
                                    <TableHead className="w-[12%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Scope</TableHead>
                                    <TableHead className="w-[12%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Posture</TableHead>
                                    <TableHead className="w-[12%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Usage</TableHead>
                                    <TableHead className="w-[12%] h-11 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 text-right pr-6">Manage</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {groupedPermissions.flatMap((category) => {
                                    const categoryKey = category.categoryKey ?? '__other__';
                                    const isCategoryCollapsed = collapsedCategoryKeys[categoryKey] ?? false;
                                    const totalCount = category.modules.reduce((s, m) => s + m.permissions.length, 0);

                                    return [
                                        <PermissionCategoryRow
                                            key={`category-${categoryKey}`}
                                            label={category.categoryLabel}
                                            count={totalCount}
                                            isCollapsed={isCategoryCollapsed}
                                            onToggle={() => toggleCategory(categoryKey)}
                                        />,
                                        ...(!isCategoryCollapsed
                                            ? category.modules.flatMap((module) => {
                                                const moduleKey = `${categoryKey}:${module.moduleKey}`;
                                                const isModuleCollapsed = collapsedModuleKeys[moduleKey] ?? false;

                                                return [
                                                    <PermissionModuleRow
                                                        key={`module-${moduleKey}`}
                                                        label={module.moduleLabel}
                                                        description={module.helperText}
                                                        count={module.permissions.length}
                                                        isCollapsed={isModuleCollapsed}
                                                        onToggle={() => toggleModule(moduleKey)}
                                                    />,
                                                    ...(!isModuleCollapsed
                                                        ? module.permissions.map((p) => (
                                                            <PermissionDataRow
                                                                key={p.id}
                                                                permission={p}
                                                                onEdit={(p) => {
                                                                    setSelectedPermission(p);
                                                                    setEditorOpen(true);
                                                                }}
                                                                onDelete={setPermissionToDelete}
                                                            />
                                                        ))
                                                        : []),
                                                ];
                                            })
                                            : []),
                                    ];
                                })}
                            </TableBody>
                        </Table>
                    </div>
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
                            { onSuccess: () => setEditorOpen(false) }
                        );
                        return;
                    }
                    createPermissionMutation.mutate(payload, {
                        onSuccess: () => setEditorOpen(false)
                    });
                }}
            />

            <AlertDialog
                open={Boolean(permissionToDelete)}
                onOpenChange={(open) => !open && setPermissionToDelete(null)}
            >
                <AlertDialogContent className="rounded-2xl border-destructive/20 shadow-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold tracking-tight">Revoke Permission</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-relaxed">
                            This will permanently remove <strong className="text-foreground">{permissionToDelete?.name}</strong> from the RBAC catalog.
                            Active role assignments using this permission may be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel disabled={deletePermissionMutation.isPending} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                            Dismiss
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                            onClick={(event) => {
                                event.preventDefault();
                                if (!permissionToDelete) return;
                                deletePermissionMutation.mutate(permissionToDelete.id, {
                                    onSuccess: () => setPermissionToDelete(null),
                                });
                            }}
                            disabled={deletePermissionMutation.isPending}
                        >
                            {deletePermissionMutation.isPending ? 'Removing...' : 'Confirm Revoke'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
