'use client';

import { UserManagementPage } from '@/features/administration/users/user-management-page';
import { ADMIN_USER_MANAGEMENT_PRESET } from '@/features/administration/users/user-management-presets';

export default function AdminUsersPage() {
    return <UserManagementPage {...ADMIN_USER_MANAGEMENT_PRESET} />;
}
