'use client';

import { UserManagementPage } from '@/features/administration/users/user-management-page';
import { ADMINISTRATOR_MANAGEMENT_PRESET } from '@/features/administration/users/user-management-presets';

export default function SuperadminAdministratorsPage() {
    return <UserManagementPage {...ADMINISTRATOR_MANAGEMENT_PRESET} />;
}
