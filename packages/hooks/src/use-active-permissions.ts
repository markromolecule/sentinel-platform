'use client';

import { useMemo } from 'react';
import { useAuth } from './auth-provider';
import { useUserQuery } from './query/users/use-user-query';

type PermissionKey = string;

export function useActivePermissions() {
    const { user, isLoading: isLoadingAuth } = useAuth();
    const { data: currentUser, isLoading: isLoadingUser } = useUserQuery(user?.id || '');

    const activePermissionKeys = useMemo(
        () => currentUser?.activePermissionKeys ?? [],
        [currentUser?.activePermissionKeys],
    );

    const activePermissionSet = useMemo(
        () => new Set(activePermissionKeys),
        [activePermissionKeys],
    );

    const hasPermission = (permissionKey: PermissionKey) => activePermissionSet.has(permissionKey);

    const hasAnyPermission = (permissionKeys: PermissionKey[]) =>
        permissionKeys.some((permissionKey) => activePermissionSet.has(permissionKey));

    const hasAllPermissions = (permissionKeys: PermissionKey[]) =>
        permissionKeys.every((permissionKey) => activePermissionSet.has(permissionKey));

    return {
        activePermissionKeys,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isLoading: isLoadingAuth || isLoadingUser,
    };
}
