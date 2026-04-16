'use client';

import { EmptyState } from '@sentinel/ui';
import { AddAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/add-admin-dialog';

export function AdministratorsEmptyState() {
    return (
        <EmptyState
            icon="🛡️"
            title="No superadmins added"
            description="Create superadmin accounts here for Sentinel core administration."
            action={<AddAdminDialog />}
        />
    );
}
