'use client';

import { UserManagementPage } from '@/features/administration/users/user-management-page';
import { ADMIN_STUDENTS_PRESET } from '@/features/administration/users/user-management-presets';

/**
 * AdminStudentsPage renders the student management page inside the identity workspace shell.
 */
export default function AdminStudentsPage() {
    return <UserManagementPage {...ADMIN_STUDENTS_PRESET} />;
}
