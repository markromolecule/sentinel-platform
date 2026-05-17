import { createElement, type ReactNode } from 'react';
import { AddUserDialog, BulkUploadDialog } from '@/app/(protected)/(admin)/users/_components';
import { AddAdminDialog } from '@/app/(protected)/(superadmin)/administrators/_components';

export type UserManagementPageVariant = 'users' | 'administrators';
export type UserManagementScopeMode = 'global' | 'institution';

export interface UserManagementPreset {
    title: string;
    description: string;
    variant: UserManagementPageVariant;
    scopeMode: UserManagementScopeMode;
    roleFilter?: string;
    actions: ReactNode;
}

/**
 * Preset configuration for the admin `/users` page.
 */
export const ADMIN_USER_MANAGEMENT_PRESET: UserManagementPreset = {
    title: 'User Management',
    description: 'Manage system access, roles, and account status.',
    variant: 'users',
    scopeMode: 'global',
    actions: createElement(
        'div',
        { className: 'flex items-center gap-2' },
        createElement(BulkUploadDialog),
        createElement(AddUserDialog),
    ),
};

/**
 * Preset configuration for the superadmin `/administrators` page.
 */
export const ADMINISTRATOR_MANAGEMENT_PRESET: UserManagementPreset = {
    title: 'Administrator Management',
    description: 'Manage system administrators and their institutional access.',
    variant: 'administrators',
    scopeMode: 'institution',
    roleFilter: 'admin',
    actions: createElement(AddAdminDialog),
};
