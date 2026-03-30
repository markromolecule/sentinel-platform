"use client";

import { EmptyState } from "@sentinel/ui";
import { AddAdminDialog } from "@/app/(protected)/(superadmin)/administrators/_components/dialogs/add-admin-dialog";

export function AdministratorsEmptyState() {
    return (
        <EmptyState
            icon="🛡️"
            title="No administrators added"
            description="Add administrators to delegate institution and system management."
            action={<AddAdminDialog />}
        />
    );
}
