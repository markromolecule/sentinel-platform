'use client';

import React from 'react';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';
import { type CoreAdminPageId } from '@/lib/authorization/core-admin-capability-map';

export type PermissionGateChildrenProps = {
    disabled?: boolean;
    readOnly?: boolean;
};

export type PermissionGateProps = {
    /** The child element(s) or a render function that receives disabled/readOnly states */
    children: React.ReactNode | ((props: PermissionGateChildrenProps) => React.ReactNode);
    /** The permission key/page ID to check, or a pre-evaluated boolean check */
    permission: CoreAdminPageId | boolean;
    /** The level of access required to bypass the gate (default: 'edit') */
    action?: 'view' | 'edit';
    /** Optional fallback content to render when permission is missing and mode is 'hide' */
    fallback?: React.ReactNode;
    /** The visual state behavior when permission is missing (default: 'hide') */
    mode?: 'hide' | 'disable' | 'readonly';
};

/**
 * PermissionGate standardizes permission-based UI orchestration.
 * Supports hiding content, disabling interactive elements, or setting them to read-only.
 */
export function PermissionGate({
    children,
    permission,
    action = 'edit',
    fallback = null,
    mode = 'hide',
}: PermissionGateProps) {
    const { canViewPage, canEditPage } = useCoreAdminCapabilities();

    let hasPermission = false;
    if (typeof permission === 'boolean') {
        hasPermission = permission;
    } else {
        if (action === 'view') {
            hasPermission = canViewPage(permission);
        } else {
            hasPermission = canEditPage(permission);
        }
    }

    if (hasPermission) {
        if (typeof children === 'function') {
            return <>{children({ disabled: false, readOnly: false })}</>;
        }
        return <>{children}</>;
    }

    if (mode === 'hide') {
        return fallback ? <>{fallback}</> : null;
    }

    if (mode === 'disable') {
        if (typeof children === 'function') {
            return <>{children({ disabled: true, readOnly: false })}</>;
        }
        if (React.isValidElement(children)) {
            return React.cloneElement(
                children as React.ReactElement<{ disabled?: boolean; 'aria-disabled'?: boolean }>,
                {
                    disabled: true,
                    'aria-disabled': true,
                }
            );
        }
        return fallback ? <>{fallback}</> : null;
    }

    if (mode === 'readonly') {
        if (typeof children === 'function') {
            return <>{children({ disabled: false, readOnly: true })}</>;
        }
        if (React.isValidElement(children)) {
            return React.cloneElement(
                children as React.ReactElement<{
                    readOnly?: boolean;
                    disabled?: boolean;
                    'aria-readonly'?: boolean;
                }>,
                {
                    readOnly: true,
                    disabled: true,
                    'aria-readonly': true,
                }
            );
        }
        return fallback ? <>{fallback}</> : null;
    }

    return fallback ? <>{fallback}</> : null;
}
