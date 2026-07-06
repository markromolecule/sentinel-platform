import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useAccessControlPermissionsQuery,
    useAccessControlRolesQuery,
    useCreateAccessControlRoleMutation,
    useDebounce,
    useDeleteAccessControlRoleMutation,
    useReplaceAccessControlRolePermissionsMutation,
    useResetAccessControlRolePermissionsToBlueprintMutation,
    useStableValue,
    useUpdateAccessControlRoleMutation,
} from '@sentinel/hooks';
import type { AccessControlRole } from '@sentinel/shared/types';
import { toast } from 'sonner';
import {
    groupPermissionsByCategoryAndModule,
    sortRolesForReview,
} from '@/app/(protected)/(support)/control/_lib/control-presenters';
import type { AccessControlPermission } from '@sentinel/shared/types';

const EMPTY_ROLES: AccessControlRole[] = [];
const EMPTY_PERMISSIONS: AccessControlPermission[] = [];

function buildDraftMap(roles: AccessControlRole[]) {
    return roles.reduce<Record<number, string[]>>((acc, role) => {
        acc[role.id] = role.permissionIds;
        return acc;
    }, {});
}

function arePermissionIdsEqual(left: string[], right: string[]) {
    if (left.length !== right.length) {
        return false;
    }

    const rightIds = new Set(right);
    return left.every((permissionId) => rightIds.has(permissionId));
}

export function useRoleMatrix() {
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearchValue = useDebounce(searchValue, 500);

    const { data: roles = EMPTY_ROLES, isLoading, error } = useAccessControlRolesQuery();
    const {
        data: filteredPermissions = EMPTY_PERMISSIONS,
        isLoading: isPermissionsLoading,
        error: permissionsError,
    } = useAccessControlPermissionsQuery(debouncedSearchValue);

    const permissions = useStableValue(() => filteredPermissions, [filteredPermissions]);

    const createRoleMutation = useCreateAccessControlRoleMutation();
    const updateRoleMutation = useUpdateAccessControlRoleMutation();
    const deleteRoleMutation = useDeleteAccessControlRoleMutation();
    const replacePermissionsMutation = useReplaceAccessControlRolePermissionsMutation({
        onSuccess: () => {}, // prevent default success toast to allow custom toast
        onError: (error) => toast.error(error.message),
    });
    const resetPermissionsMutation = useResetAccessControlRolePermissionsToBlueprintMutation();

    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<AccessControlRole | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<AccessControlRole | null>(null);
    const [draftPermissionIdsByRoleId, setDraftPermissionIdsByRoleId] = useState<
        Record<number, string[]>
    >({});
    const [savingRoleIds, setSavingRoleIds] = useState<number[]>([]);
    const [collapsedCategoryKeys, setCollapsedCategoryKeys] = useState<Record<string, boolean>>({});
    const [collapsedModuleKeys, setCollapsedModuleKeys] = useState<Record<string, boolean>>({});

    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [editingRoleName, setEditingRoleName] = useState('');
    const pendingPermissionIdsByRoleIdRef = useRef<Record<number, string[]>>({});
    const confirmedPermissionIdsByRoleIdRef = useRef<Record<number, string[]>>({});

    const sortedRoles = useStableValue(() => sortRolesForReview(roles), [roles]);
    const debouncedDraftPermissionIdsByRoleId = useDebounce(draftPermissionIdsByRoleId, 250);

    useEffect(() => {
        setDraftPermissionIdsByRoleId((current) => {
            const next = buildDraftMap(sortedRoles);
            let hasChanged = false;

            sortedRoles.forEach((role) => {
                const currentDraft = current[role.id];
                const confirmedPermissionIds = confirmedPermissionIdsByRoleIdRef.current[role.id];

                if (currentDraft && !arePermissionIdsEqual(currentDraft, role.permissionIds)) {
                    next[role.id] = currentDraft;
                } else if (
                    confirmedPermissionIds &&
                    arePermissionIdsEqual(confirmedPermissionIds, role.permissionIds)
                ) {
                    next[role.id] = confirmedPermissionIds;
                }

                const pendingPermissionIds = pendingPermissionIdsByRoleIdRef.current[role.id];

                if (
                    pendingPermissionIds &&
                    arePermissionIdsEqual(pendingPermissionIds, role.permissionIds)
                ) {
                    delete pendingPermissionIdsByRoleIdRef.current[role.id];
                }

                if (
                    confirmedPermissionIds &&
                    arePermissionIdsEqual(confirmedPermissionIds, role.permissionIds)
                ) {
                    delete confirmedPermissionIdsByRoleIdRef.current[role.id];
                }
            });

            // Deep check if next is different from current to avoid unnecessary state updates
            const currentKeys = Object.keys(current);
            const nextKeys = Object.keys(next);

            if (currentKeys.length !== nextKeys.length) {
                hasChanged = true;
            } else {
                hasChanged = currentKeys.some((roleId) => {
                    const rId = Number(roleId);
                    return (
                        !current[rId] ||
                        !next[rId] ||
                        !arePermissionIdsEqual(current[rId], next[rId])
                    );
                });
            }

            return hasChanged ? next : current;
        });
    }, [sortedRoles]);

    const groupedPermissions = useStableValue(
        () => groupPermissionsByCategoryAndModule(filteredPermissions),
        [filteredPermissions],
    );

    useEffect(() => {
        setCollapsedCategoryKeys((current) => {
            let hasChanged = false;
            const next = { ...current };

            groupedPermissions.forEach((category) => {
                const key = category.categoryKey ?? '__other__';
                if (!(key in next)) {
                    next[key] = true;
                    hasChanged = true;
                }
            });

            return hasChanged ? next : current;
        });

        setCollapsedModuleKeys((current) => {
            let hasChanged = false;
            const next = { ...current };

            groupedPermissions.forEach((category) => {
                const categoryKey = category.categoryKey ?? '__other__';
                category.modules.forEach((module) => {
                    const moduleKey = `${categoryKey}:${module.moduleKey}`;
                    if (!(moduleKey in next)) {
                        next[moduleKey] = true;
                        hasChanged = true;
                    }
                });
            });

            return hasChanged ? next : current;
        });
    }, [groupedPermissions]);

    /**
     * Reconciles and saves modified permissions mapping for a given role ID.
     * Uses a ref-based pending/confirmed tracking system to avoid race conditions
     * during React Query invalidation and subsequent refetches.
     */
    const saveRolePermissions = useCallback(
        async (roleId: number, permissionIds: string[]) => {
            const currentRole = sortedRoles.find((role) => role.id === roleId);
            const pendingPermissionIds = pendingPermissionIdsByRoleIdRef.current[roleId];

            if (!currentRole || arePermissionIdsEqual(permissionIds, currentRole.permissionIds)) {
                delete pendingPermissionIdsByRoleIdRef.current[roleId];
                return;
            }

            if (
                pendingPermissionIds &&
                arePermissionIdsEqual(pendingPermissionIds, permissionIds)
            ) {
                return;
            }

            pendingPermissionIdsByRoleIdRef.current[roleId] = permissionIds;
            setSavingRoleIds((current) =>
                current.includes(roleId) ? current : [...current, roleId],
            );

            try {
                const updatedRole = await replacePermissionsMutation.mutateAsync({
                    roleId,
                    permissionIds,
                });
                confirmedPermissionIdsByRoleIdRef.current[roleId] = updatedRole.permissionIds;

                // Reconcile draftPermissionIdsByRoleId immediately
                setDraftPermissionIdsByRoleId((current) => ({
                    ...current,
                    [roleId]: updatedRole.permissionIds,
                }));

                if (arePermissionIdsEqual(updatedRole.permissionIds, permissionIds)) {
                    delete pendingPermissionIdsByRoleIdRef.current[roleId];
                    delete confirmedPermissionIdsByRoleIdRef.current[roleId];
                }

                if (
                    currentRole.isSystem &&
                    currentRole.permissionSyncMode !== 'CUSTOM' &&
                    updatedRole.permissionSyncMode === 'CUSTOM'
                ) {
                    toast.success(`Role "${currentRole.name}" is now Support-customized.`);
                } else {
                    toast.success('Role permissions updated successfully.');
                }
            } catch {
                delete pendingPermissionIdsByRoleIdRef.current[roleId];
                delete confirmedPermissionIdsByRoleIdRef.current[roleId];
                // Roll draft back to last known server state
                setDraftPermissionIdsByRoleId((current) => {
                    const currentRole = sortedRoles.find((r) => r.id === roleId);
                    if (!currentRole) return current;
                    return {
                        ...current,
                        [roleId]: currentRole.permissionIds,
                    };
                });
            } finally {
                setSavingRoleIds((current) => current.filter((id) => id !== roleId));
            }
        },
        [replacePermissionsMutation, sortedRoles],
    );

    const resetRolePermissions = useCallback(
        async (roleId: number) => {
            setSavingRoleIds((current) =>
                current.includes(roleId) ? current : [...current, roleId],
            );
            try {
                const updatedRole = await resetPermissionsMutation.mutateAsync(roleId);

                // Reconcile draft
                setDraftPermissionIdsByRoleId((current) => ({
                    ...current,
                    [roleId]: updatedRole.permissionIds,
                }));

                // Clear refs
                delete pendingPermissionIdsByRoleIdRef.current[roleId];
                delete confirmedPermissionIdsByRoleIdRef.current[roleId];

                toast.success(`Role "${updatedRole.name}" reset to blueprint permissions.`);
                return updatedRole;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Failed to reset role permissions.';
                toast.error(message);
                return null;
            } finally {
                setSavingRoleIds((current) => current.filter((id) => id !== roleId));
            }
        },
        [resetPermissionsMutation],
    );

    const handlePermissionToggle = (roleId: number, permissionId: string, checked: boolean) => {
        setDraftPermissionIdsByRoleId((current) => {
            const currentPermissionIds = current[roleId] ?? [];
            const nextPermissionIds = checked
                ? Array.from(new Set([...currentPermissionIds, permissionId]))
                : currentPermissionIds.filter((id) => id !== permissionId);

            return {
                ...current,
                [roleId]: nextPermissionIds,
            };
        });
    };

    useEffect(() => {
        sortedRoles.forEach((role) => {
            const permissionIds = debouncedDraftPermissionIdsByRoleId[role.id];

            if (!permissionIds || savingRoleIds.includes(role.id)) {
                return;
            }

            const pendingPermissionIds = pendingPermissionIdsByRoleIdRef.current[role.id];

            if (
                pendingPermissionIds &&
                arePermissionIdsEqual(pendingPermissionIds, permissionIds)
            ) {
                return;
            }

            if (!arePermissionIdsEqual(permissionIds, role.permissionIds)) {
                void saveRolePermissions(role.id, permissionIds);
            }
        });
    }, [debouncedDraftPermissionIdsByRoleId, saveRolePermissions, savingRoleIds, sortedRoles]);

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

    const startRoleNameEdit = (role: AccessControlRole) => {
        if (role.isSystem) {
            toast.info('System role names are locked and sync automatically.');
            return;
        }

        setEditingRoleId(role.id);
        setEditingRoleName(role.name);
    };

    const submitRoleNameEdit = async (role: AccessControlRole) => {
        const nextName = editingRoleName.trim();

        if (role.isSystem || nextName.length < 2 || nextName === role.name) {
            setEditingRoleId(null);
            setEditingRoleName('');
            return;
        }

        setSavingRoleIds((current) =>
            current.includes(role.id) ? current : [...current, role.id],
        );

        updateRoleMutation.mutate(
            {
                roleId: role.id,
                payload: {
                    name: nextName,
                },
            },
            {
                onSuccess: () => {
                    setEditingRoleId(null);
                    setEditingRoleName('');
                },
                onSettled: () => {
                    setSavingRoleIds((current) => current.filter((id) => id !== role.id));
                },
            },
        );
    };

    const isBusy = isLoading || isPermissionsLoading;
    const pageError = error || permissionsError;

    return {
        // Data
        roles,
        sortedRoles,
        permissions,
        filteredPermissions,
        groupedPermissions,

        // State
        isBusy,
        pageError,
        editorOpen,
        selectedRole,
        roleToDelete,
        searchValue,
        draftPermissionIdsByRoleId,
        savingRoleIds,
        collapsedCategoryKeys,
        collapsedModuleKeys,
        editingRoleId,
        editingRoleName,

        // Mutations
        createRoleMutation,
        updateRoleMutation,
        deleteRoleMutation,

        // Setters
        setEditorOpen,
        setSelectedRole,
        setRoleToDelete,
        setSearchValue,
        setEditingRoleId,
        setEditingRoleName,

        // Actions
        handlePermissionToggle,
        toggleCategory,
        toggleModule,
        startRoleNameEdit,
        submitRoleNameEdit,
        resetRolePermissions,
    };
}
