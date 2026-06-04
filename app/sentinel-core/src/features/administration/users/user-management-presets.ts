import { createElement, type ReactNode } from 'react';
import { AddUserDialog, BulkUploadDialog } from '@/app/(protected)/administrators/_components';
import { AddAdminDialog } from '@/app/(protected)/administrators/_components';
import { AddStudentWhitelistDialog } from '@/app/(protected)/administrators/whitelist/_components/dialogs/add-student-whitelist-dialog';
import { UserPlus } from 'lucide-react';

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
 * Preset configuration for the consolidated admin Identity & Access page.
 */
export const ADMIN_IDENTITY_MANAGEMENT_PRESET: UserManagementPreset = {
    title: 'Identity & Access',
    description: 'Manage institutional users, roles, and whitelist status.',
    variant: 'users',
    scopeMode: 'institution',
    actions: createElement(
        'div',
        { className: 'flex items-center gap-2' },
        createElement(BulkUploadDialog),
        createElement(AddUserDialog),
    ),
};

/**
 * Preset configuration for student management under the unified administrators path.
 */
export const ADMIN_STUDENTS_PRESET: UserManagementPreset = {
    title: 'Students',
    description: 'Manage student accounts, registrations, and whitelist records.',
    variant: 'users',
    scopeMode: 'institution',
    roleFilter: 'student',
    actions: createElement(AddStudentWhitelistDialog, {
        triggerLabel: 'Add User',
        triggerIcon: createElement(UserPlus, { className: 'mr-2 h-4 w-4' }),
    }),
};

/**
 * Preset configuration for instructor management under the unified administrators path.
 */
export const ADMIN_INSTRUCTORS_PRESET: UserManagementPreset = {
    title: 'Instructors',
    description: 'Manage instructor accounts and academic permissions.',
    variant: 'users',
    scopeMode: 'institution',
    roleFilter: 'instructor',
    actions: createElement(AddUserDialog),
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
