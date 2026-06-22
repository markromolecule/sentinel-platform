'use client';

import React from 'react';
import { useActivePermissions } from './use-active-permissions';

export interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children?: React.ReactNode;
}

/**
 * Reusable wrapper to conditionally render children based on active user permissions.
 */
export function PermissionGuard({
    permission,
    permissions,
    requireAll = false,
    fallback = null,
    children,
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useActivePermissions();

    // Check single permission
    if (permission) {
        if (!hasPermission(permission)) {
            return <>{fallback}</>;
        }
    }

    // Check array of permissions
    if (permissions && permissions.length > 0) {
        if (requireAll) {
            if (!hasAllPermissions(permissions)) {
                return <>{fallback}</>;
            }
        } else {
            if (!hasAnyPermission(permissions)) {
                return <>{fallback}</>;
            }
        }
    }

    // If neither is provided, allow rendering by default or fallback?
    // Let's assume if neither is specified, it's allowed, or it requires at least one match.
    // In practice, either permission or permissions will be provided.

    return <>{children}</>;
}
