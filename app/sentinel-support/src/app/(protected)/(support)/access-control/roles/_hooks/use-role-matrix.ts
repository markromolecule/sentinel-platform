import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useAccessControlPermissionsQuery,
    useAccessControlRolesQuery,
    useCreateAccessControlRoleMutation,
    useDebounce,
    useDeleteAccessControlRoleMutation,
    useReplaceAccessControlRolePermissionsMutation,
    useStableValue,
    useUpdateAccessControlRoleMutation,
} from '@sentinel/hooks';
import type { AccessControlRole } from '@sentinel/shared/types';
import { toast } from 'sonner';
import {
    formatActionLabel,
    formatModuleLabel,
    getPermissionCategoryLabel,
    getPermissionScopeLabel,
    groupPermissionsByCategoryAndModule,
    sortRolesForReview,
} from '@/app/(protected)/(support)/access-control/_lib/access-control-presenters';
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
    const replacePermissionsMutation = useReplaceAccessControlRolePermissionsMutation();

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

    const sortedRoles = useStableValue(() => sortRolesForReview(roles), [roles]);
    const debouncedDraftPermissionIdsByRoleId = useDebounce(draftPermissionIdsByRoleId, 250);

    useEffect(() => {
        setDraftPermissionIdsByRoleId((current) => {
            const next = buildDraftMap(sortedRoles);
            let hasChanged = false;

            sortedRoles.forEach((role) => {
                const currentDraft = current[role.id];

                if (currentDraft && !arePermissionIdsEqual(currentDraft, role.permissionIds)) {
                    next[role.id] = currentDraft;
                }

                const pendingPermissionIds = pendingPermissionIdsByRoleIdRef.current[role.id];

                if (
                    pendingPermissionIds &&
                    arePermissionIdsEqual(pendingPermissionIds, role.permissionIds)
                ) {
                    delete pendingPermissionIdsByRoleIdRef.current[role.id];
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
                await replacePermissionsMutation.mutateAsync({
                    roleId,
                    permissionIds,
                });
            } catch {
                delete pendingPermissionIdsByRoleIdRef.current[roleId];
                return;
            } finally {
                setSavingRoleIds((current) => current.filter((id) => id !== roleId));
            }
        },
        [replacePermissionsMutation, sortedRoles],
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
    };
}
