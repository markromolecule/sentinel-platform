'use client';

import { useEffect, useState } from 'react';
import { useStableValue } from '@sentinel/hooks';
import {
    Badge,
    Button,
    Checkbox,
    SearchBar,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import type { AccessControlPermission, AccessControlRole } from '@sentinel/shared/types';
import {
    formatActionLabel,
    formatModuleLabel,
    getActionSortIndex,
    getModuleSortIndex,
    getPermissionCategoryLabel,
    getPermissionScopeLabel,
    mapActionKeyToCrudBucket,
} from '@/app/(protected)/(support)/control/_lib/control-presenters';

type RolePermissionWorkspaceProps = {
    role?: AccessControlRole | null;
    permissions: AccessControlPermission[];
    isPending?: boolean;
    onSubmit: (permissionIds: string[]) => void;
};

type AccessFilter = 'all' | 'assigned' | 'unassigned';

function hasPermissionSelectionChanged(currentIds: string[], initialIds: string[]) {
    if (currentIds.length !== initialIds.length) {
        return true;
    }

    const initialSet = new Set(initialIds);
    return currentIds.some((permissionId) => !initialSet.has(permissionId));
}

function formatDistinctLabels(values: string[]) {
    if (values.length === 0) {
        return 'None';
    }

    if (values.length <= 3) {
        return values.join(', ');
    }

    return `${values.slice(0, 3).join(', ')} +${values.length - 3} more`;
}

export function RolePermissionWorkspace({
    role,
    permissions,
    isPending,
    onSubmit,
}: RolePermissionWorkspaceProps) {
    const [searchValue, setSearchValue] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

    useEffect(() => {
        setSelectedPermissionIds(role?.permissionIds ?? []);
        setSearchValue('');
        setModuleFilter('all');
        setCategoryFilter('all');
        setAccessFilter('all');
    }, [role?.id]);

    const selectedPermissionIdSet = useStableValue(
        () => new Set(selectedPermissionIds),
        [selectedPermissionIds],
    );

    const moduleOptions = useStableValue(
        () =>
            Array.from(new Set(permissions.map((permission) => permission.moduleKey)))
                .sort(
                    (left, right) =>
                        getModuleSortIndex(left) - getModuleSortIndex(right) ||
                        left.localeCompare(right),
                )
                .map((moduleKey) => ({
                    value: moduleKey,
                    label: formatModuleLabel(moduleKey),
                })),
        [permissions],
    );

    const categoryOptions = useStableValue(
        () =>
            Array.from(
                new Set(permissions.map((permission) => permission.category?.trim() || 'other')),
            )
                .sort((left, right) =>
                    getPermissionCategoryLabel(left).localeCompare(
                        getPermissionCategoryLabel(right),
                    ),
                )
                .map((categoryKey) => ({
                    value: categoryKey,
                    label: getPermissionCategoryLabel(categoryKey === 'other' ? null : categoryKey),
                })),
        [permissions],
    );

    const filteredPermissions = useStableValue(() => {
        const normalizedSearch = searchValue.trim().toLowerCase();
        const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);

        return [...permissions]
            .filter((permission) => {
                if (moduleFilter !== 'all' && permission.moduleKey !== moduleFilter) {
                    return false;
                }

                const normalizedCategory = permission.category?.trim() || 'other';
                if (categoryFilter !== 'all' && normalizedCategory !== categoryFilter) {
                    return false;
                }

                const isAssigned = selectedPermissionIdSet.has(permission.id);
                if (accessFilter === 'assigned' && !isAssigned) {
                    return false;
                }

                if (accessFilter === 'unassigned' && isAssigned) {
                    return false;
                }

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
            })
            .sort((left, right) => {
                const selectionDifference =
                    Number(selectedPermissionIdSet.has(right.id)) -
                    Number(selectedPermissionIdSet.has(left.id));

                if (selectionDifference !== 0) {
                    return selectionDifference;
                }

                return (
                    getModuleSortIndex(left.moduleKey) - getModuleSortIndex(right.moduleKey) ||
                    left.moduleKey.localeCompare(right.moduleKey) ||
                    getActionSortIndex(left.actionKey) - getActionSortIndex(right.actionKey) ||
                    left.actionKey.localeCompare(right.actionKey) ||
                    left.name.localeCompare(right.name)
                );
            });
    }, [
        accessFilter,
        categoryFilter,
        moduleFilter,
        permissions,
        searchValue,
        selectedPermissionIdSet,
    ]);

    const selectedPermissions = useStableValue(
        () => permissions.filter((permission) => selectedPermissionIdSet.has(permission.id)),
        [permissions, selectedPermissionIdSet],
    );

    const selectedModuleCount = useStableValue(
        () => new Set(selectedPermissions.map((permission) => permission.moduleKey)).size,
        [selectedPermissions],
    );

    const selectedCategoryLabels = useStableValue(
        () =>
            Array.from(
                new Set(
                    selectedPermissions.map((permission) =>
                        getPermissionCategoryLabel(permission.category),
                    ),
                ),
            ).sort((left, right) => left.localeCompare(right)),
        [selectedPermissions],
    );

    const visiblePermissionIds = useStableValue(
        () => filteredPermissions.map((permission) => permission.id),
        [filteredPermissions],
    );
    const selectedVisibleCount = useStableValue(
        () =>
            filteredPermissions.filter((permission) => selectedPermissionIdSet.has(permission.id))
                .length,
        [filteredPermissions, selectedPermissionIdSet],
    );
    const hasUnsavedChanges = hasPermissionSelectionChanged(
        selectedPermissionIds,
        role?.permissionIds ?? [],
    );

    const togglePermission = (permissionId: string, checked: boolean | 'indeterminate') => {
        setSelectedPermissionIds((current) => {
            if (checked) {
                return Array.from(new Set([...current, permissionId]));
            }

            return current.filter((id) => id !== permissionId);
        });
    };

    const toggleVisiblePermissions = (checked: boolean) => {
        const visibleSet = new Set(visiblePermissionIds);

        setSelectedPermissionIds((current) =>
            checked
                ? Array.from(new Set([...current, ...visiblePermissionIds]))
                : current.filter((id) => !visibleSet.has(id)),
        );
    };

    const resetSelection = () => {
        setSelectedPermissionIds(role?.permissionIds ?? []);
        setSearchValue('');
        setModuleFilter('all');
        setCategoryFilter('all');
        setAccessFilter('all');
    };

    if (!role) {
        return (
            <div className="border-border/70 overflow-hidden rounded-xl border border-dashed">
                <div className="border-border/70 bg-muted/20 border-b px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold tracking-tight">2. Edit role access</h2>
                    <p className="text-muted-foreground text-sm">
                        Select a role above, then check the permissions that role should receive.
                    </p>
                </div>
                <div className="flex min-h-[320px] items-center justify-center px-6 py-12 text-center">
                    <div>
                        <div className="text-foreground font-medium">No role selected</div>
                        <p className="text-muted-foreground mt-2 max-w-md text-sm">
                            Choose a role from the register to open its permission inventory, filter
                            access by module or category, and save changes without leaving the page.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-border/70 overflow-hidden rounded-xl border">
            <div className="border-border/70 bg-muted/20 border-b px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold tracking-tight">
                                2. Edit role access
                            </h2>
                            <Badge variant="outline">
                                {role.isSystem ? 'System role' : 'Custom role'}
                            </Badge>
                            {hasUnsavedChanges ? (
                                <Badge variant="secondary">Unsaved changes</Badge>
                            ) : null}
                        </div>
                        <div>
                            <div className="text-foreground text-base font-semibold">
                                {role.name}
                            </div>
                            <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
                                {role.description ||
                                    'No description has been recorded for this role yet.'}
                            </p>
                            <p className="text-muted-foreground max-w-3xl text-sm">
                                Checked permissions are granted to this role. Filter the list,
                                review the checked rows, then save when the access looks right.
                            </p>
                        </div>
                        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 text-xs">
                            <span>{selectedPermissionIds.length} granted</span>
                            <span>{selectedVisibleCount} checked in this view</span>
                            <span>{selectedModuleCount} areas covered</span>
                            <span>Categories: {formatDistinctLabels(selectedCategoryLabels)}</span>
                            <span>{permissions.length} total permissions</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVisiblePermissions(true)}
                            disabled={visiblePermissionIds.length === 0}
                        >
                            Assign visible
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleVisiblePermissions(false)}
                            disabled={visiblePermissionIds.length === 0}
                        >
                            Clear visible
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetSelection}
                            disabled={
                                !hasUnsavedChanges &&
                                searchValue.length === 0 &&
                                moduleFilter === 'all' &&
                                categoryFilter === 'all' &&
                                accessFilter === 'all'
                            }
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onSubmit(selectedPermissionIds)}
                            disabled={!hasUnsavedChanges || isPending}
                        >
                            {isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-border/70 border-b px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                    <SearchBar
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search permission, module, action, category, scope, or key..."
                        containerClassName="w-full xl:max-w-md"
                    />

                    <div className="grid gap-3 sm:grid-cols-3 xl:w-auto">
                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                            <SelectTrigger className="min-w-[180px]">
                                <SelectValue placeholder="All modules" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All modules</SelectItem>
                                {moduleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="min-w-[180px]">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categoryOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={accessFilter}
                            onValueChange={(value) => setAccessFilter(value as AccessFilter)}
                        >
                            <SelectTrigger className="min-w-[180px]">
                                <SelectValue placeholder="All permissions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All permissions</SelectItem>
                                <SelectItem value="assigned">Assigned only</SelectItem>
                                <SelectItem value="unassigned">Unassigned only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    <span>{filteredPermissions.length} visible</span>
                    <span>{selectedVisibleCount} checked in current view</span>
                    <span>{permissions.length} total in catalog</span>
                </div>
            </div>

            <div data-lenis-prevent className="max-h-[36rem] overflow-auto">
                <Table className="min-w-[980px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-background hover:bg-background">
                            <TableHead className="bg-background sticky top-0 z-10 w-[56px] whitespace-normal">
                                <Checkbox
                                    checked={
                                        visiblePermissionIds.length > 0 &&
                                        selectedVisibleCount === visiblePermissionIds.length
                                            ? true
                                            : selectedVisibleCount > 0
                                              ? 'indeterminate'
                                              : false
                                    }
                                    onCheckedChange={(checked) =>
                                        toggleVisiblePermissions(Boolean(checked))
                                    }
                                    aria-label="Toggle all visible permissions"
                                />
                            </TableHead>
                            <TableHead className="bg-background sticky top-0 z-10 w-[40%] whitespace-normal">
                                Permission
                            </TableHead>
                            <TableHead className="bg-background sticky top-0 z-10 w-[18%] whitespace-normal">
                                Area
                            </TableHead>
                            <TableHead className="bg-background sticky top-0 z-10 w-[12%] whitespace-normal">
                                Action
                            </TableHead>
                            <TableHead className="bg-background sticky top-0 z-10 w-[12%] whitespace-normal">
                                Scope
                            </TableHead>
                            <TableHead className="bg-background sticky top-0 z-10 w-[18%] whitespace-normal">
                                Used by
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPermissions.length > 0 ? (
                            filteredPermissions.map((permission) => {
                                const isAssigned = selectedPermissionIdSet.has(permission.id);
                                const crudBucket = mapActionKeyToCrudBucket(permission.actionKey);

                                return (
                                    <TableRow
                                        key={permission.id}
                                        data-state={isAssigned ? 'selected' : undefined}
                                        className="cursor-pointer"
                                        onClick={() => togglePermission(permission.id, !isAssigned)}
                                    >
                                        <TableCell
                                            className="align-top"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            <Checkbox
                                                checked={isAssigned}
                                                onCheckedChange={(checked) =>
                                                    togglePermission(permission.id, checked)
                                                }
                                                aria-label={`Toggle ${permission.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="align-top break-words whitespace-normal">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-foreground font-medium">
                                                        {permission.name}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            isAssigned ? 'default' : 'secondary'
                                                        }
                                                    >
                                                        {isAssigned ? 'Assigned' : 'Available'}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {crudBucket.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <div className="text-muted-foreground text-xs break-all">
                                                    {permission.key}
                                                </div>
                                                <div className="text-muted-foreground text-sm">
                                                    {permission.description ||
                                                        'No description provided for this permission.'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top break-words whitespace-normal">
                                            <div className="space-y-1">
                                                <div>{formatModuleLabel(permission.moduleKey)}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    {getPermissionCategoryLabel(
                                                        permission.category,
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top break-words whitespace-normal">
                                            {formatActionLabel(permission.actionKey)}
                                        </TableCell>
                                        <TableCell className="align-top break-words whitespace-normal">
                                            {getPermissionScopeLabel(permission.scope)}
                                        </TableCell>
                                        <TableCell className="align-top break-words whitespace-normal">
                                            <div className="text-foreground text-sm">
                                                {permission.roleCount} roles
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {permission.overrideCount} overrides
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell
                                    colSpan={6}
                                    className="text-muted-foreground px-6 py-14 text-center text-sm"
                                >
                                    No permissions match the current filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
