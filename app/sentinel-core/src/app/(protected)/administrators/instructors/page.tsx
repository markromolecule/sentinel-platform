'use client';

import { UserManagementPage } from '@/features/administration/users/user-management-page';
import { ADMIN_INSTRUCTORS_PRESET } from '@/features/administration/users/user-management-presets';

/**
 * AdminInstructorsPage renders the instructor management page inside the identity workspace shell.
 */
export default function AdminInstructorsPage() {
    return <UserManagementPage {...ADMIN_INSTRUCTORS_PRESET} />;
}
