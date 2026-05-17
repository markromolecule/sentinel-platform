'use client';

import { EmptyState } from '@sentinel/ui';
import { AddSuperAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';
import {
    getAdministratorRoleConfig,
    type AdministratorRole,
} from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

interface AdministratorsEmptyStateProps {
    role: AdministratorRole;
}

export function AdministratorsEmptyState({ role }: AdministratorsEmptyStateProps) {
    const config = getAdministratorRoleConfig(role);

    return (
        <EmptyState
            icon="🛡️"
            title={config.emptyTitle}
            description={config.emptyDescription}
            action={<AddSuperAdminDialog role={role} />}
        />
    );
}
