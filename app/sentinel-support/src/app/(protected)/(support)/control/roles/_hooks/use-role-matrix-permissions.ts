import { useCallback, useEffect, useRef, useState } from 'react';
import {
    useDebounce,
    useReplaceAccessControlRolePermissionsMutation,
    useResetAccessControlRolePermissionsToBlueprintMutation,
} from '@sentinel/hooks';
import type { AccessControlRole } from '@sentinel/shared/types';
import { toast } from 'sonner';

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

/**
 * Custom hook to manage permission drafting, toggle updates, reset actions, and debounced auto-saving.
 * 
 * @param sortedRoles The list of active roles sorted and ready for comparison with draft changes.
 */
export function useRoleMatrixPermissions(sortedRoles: AccessControlRole[]) {
    const replacePermissionsMutation = useReplaceAccessControlRolePermissionsMutation({
        onSuccess: () => {}, // prevent default success toast to allow custom toast
        onError: (error) => toast.error(error.message),
    });
    const resetPermissionsMutation = useResetAccessControlRolePermissionsToBlueprintMutation();

    const [draftPermissionIdsByRoleId, setDraftPermissionIdsByRoleId] = useState<
        Record<number, string[]>
    >({});
    const [savingRoleIds, setSavingRoleIds] = useState<number[]>([]);

    const pendingPermissionIdsByRoleIdRef = useRef<Record<number, string[]>>({});
    const confirmedPermissionIdsByRoleIdRef = useRef<Record<number, string[]>>({});

    const debouncedDraftPermissionIdsByRoleId = useDebounce(draftPermissionIdsByRoleId, 250);

    // Sync roles query updates into local draft permissions mapping
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

    // Save mutated permissions to the backend
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
                setDraftPermissionIdsByRoleId((current) => {
                    const currentDraft = current[roleId] ?? [];
                    if (!arePermissionIdsEqual(currentDraft, permissionIds)) {
                        // User made subsequent changes, keep the new draft
                        return current;
                    }
                    return {
                        ...current,
                        [roleId]: updatedRole.permissionIds,
                    };
                });

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
                // Roll draft back to last known server state only if it hasn't been modified since
                setDraftPermissionIdsByRoleId((current) => {
                    const currentDraft = current[roleId] ?? [];
                    if (!arePermissionIdsEqual(currentDraft, permissionIds)) {
                        return current;
                    }
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

    // Watch debounced draft changes and queue save commands
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

    // Handle single permission toggle
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

    // Reset role permissions back to default system blueprints
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

    return {
        draftPermissionIdsByRoleId,
        savingRoleIds,
        handlePermissionToggle,
        resetRolePermissions,
    };
}
