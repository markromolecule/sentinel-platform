import { useState, useLayoutEffect, type ReactNode } from 'react';
import {
    useAccessControlPermissionsQuery,
    useCreateAccessControlPermissionMutation,
    useDebounce,
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
import {
    AccessControlEmptyState,
    AccessControlErrorState,
    AccessControlLoadingState,
    PermissionEditorDialog,
} from '@/app/(protected)/(support)/control/_components';
import { groupPermissionsByCategoryAndModule } from '@/app/(protected)/(support)/control/_lib/control-presenters';
import {
    PermissionCategoryRow,
    PermissionDataRow,
    PermissionModuleRow,
} from '../permissions/permission-table-components';
import { Plus } from 'lucide-react';

export function PermissionRegistryView({
    setActions,
}: {
    setActions?: (actions: ReactNode) => void;
}) {
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const {
        data: filteredPermissions = [],
        isLoading,
        error,
    } = useAccessControlPermissionsQuery(debouncedSearchValue);

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
    const [expandedCategoryKeys, setExpandedCategoryKeys] = useState<Record<string, boolean>>({});
    const [expandedModuleKeys, setExpandedModuleKeys] = useState<Record<string, boolean>>({});

    const groupedPermissions = useStableValue(
        () => groupPermissionsByCategoryAndModule(filteredPermissions),
        [filteredPermissions],
    );

    const systemPermissionCount = useStableValue(
        () => filteredPermissions.filter((permission) => permission.isSystem).length,
        [filteredPermissions],
    );

    const toggleCategory = (categoryKey: string) => {
        setExpandedCategoryKeys((current) => ({
            ...current,
            [categoryKey]: !current[categoryKey],
        }));
    };

    const toggleModule = (moduleKey: string) => {
        setExpandedModuleKeys((current) => ({
            ...current,
            [moduleKey]: !current[moduleKey],
        }));
    };

    useLayoutEffect(() => {
        setActions?.(
            <Button
                size="sm"
                onClick={() => {
                    setSelectedPermission(null);
                    setEditorOpen(true);
                }}
                className="h-10 rounded-none bg-[#323d8f] px-6 text-[12px] font-bold hover:bg-[#323d8f]/90"
            >
                <Plus className="mr-2 h-4 w-4" />
                New Permission
            </Button>,
        );
        return () => setActions?.(null);
    }, [setActions]);

    if (isLoading) return <AccessControlLoadingState label="Indexing registry..." />;
    if (error) return <AccessControlErrorState message={error.message} />;

    if (filteredPermissions.length === 0 && !searchValue) {
        return (
            <AccessControlEmptyState
                title="Empty Registry"
                description="No permissions have been defined yet. Start by creating a system or custom permission baseline."
                action={
                    <Button
                        size="sm"
                        onClick={() => {
                            setSelectedPermission(null);
                            setEditorOpen(true);
                        }}
                        className="mt-4 h-10 rounded-none bg-[#323d8f] px-6 text-[12px] font-bold hover:bg-[#323d8f]/90"
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
                        className="border-muted/50 bg-background/50 focus-visible:ring-primary/20 h-11 rounded-none"
                    />
                    <div className="text-foreground flex items-center gap-4 text-[12px] font-semibold">
                        <div className="flex items-center gap-1.5">
                            <div className="bg-primary size-1.5 rounded-full" />
                            <span>{filteredPermissions.length} Results</span>
                        </div>
                        <div className="bg-muted-foreground/30 size-1 rounded-full" />
                        <span>{systemPermissionCount} System</span>
                        <div className="bg-muted-foreground/30 size-1 rounded-full" />
                        <span>{filteredPermissions.length - systemPermissionCount} Custom</span>
                    </div>
                </div>
            </div>

            {filteredPermissions.length === 0 ? (
                <div className="border-muted/50 bg-muted/5 rounded-none border border-dashed py-20 text-center">
                    <AccessControlEmptyState
                        title="No Matches"
                        description="We couldn't find any permissions matching your current search criteria."
                        action={
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchValue('')}
                                className="mt-4 h-10 rounded-none px-6 text-[12px] font-bold"
                            >
                                Clear Search
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="max-h-[calc(100vh-18rem)] overflow-auto">
                    <Table className="min-w-full">
                        <TableHeader className="bg-muted/5 border-muted/50 sticky top-0 z-10 border-b">
                            <TableRow className="h-12 border-t border-r border-l border-[#323d8f]/10 hover:bg-transparent">
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[40%] border-r pl-6 text-[12px] font-semibold">
                                    Permission
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[12%] border-r text-center text-[12px] font-semibold">
                                    Action
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[12%] border-r text-center text-[12px] font-semibold">
                                    Scope
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[8%] border-r text-center text-[12px] font-semibold">
                                    Posture
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 border-muted/50 w-[15%] border-r text-center text-[12px] font-semibold">
                                    Usage
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 w-[13%] pr-6 text-right text-[12px] font-semibold">
                                    Manage
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="border-b border-[#323d8f]/10">
                            {groupedPermissions.flatMap((category) => {
                                const categoryKey = category.categoryKey ?? '__other__';
                                const isCategoryCollapsed = !expandedCategoryKeys[categoryKey];
                                const totalCount = category.modules.reduce(
                                    (s, m) => s + m.permissions.length,
                                    0,
                                );

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
                                            const isModuleCollapsed =
                                                !expandedModuleKeys[moduleKey];

                                            return [
                                                <PermissionModuleRow
                                                    key={`module-${moduleKey}`}
                                                    label={module.moduleLabel}
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
                <AlertDialogContent className="border-muted/50 rounded-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[18px] font-semibold tracking-tight">
                            Revoke Permission
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-[14px] leading-relaxed">
                            This will permanently remove{' '}
                            <strong className="text-foreground font-semibold">
                                {permissionToDelete?.name}
                            </strong>{' '}
                            from the RBAC catalog. Active role assignments using this permission may
                            be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel
                            disabled={deletePermissionMutation.isPending}
                            className="h-10 rounded-none px-6 text-[12px] font-semibold"
                        >
                            Dismiss
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 rounded-none px-6 text-[12px] font-semibold"
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
