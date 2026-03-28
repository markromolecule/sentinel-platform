"use client";

import { AdministratorsList } from "@/app/(protected)/(superadmin)/administrators/_components/administrators-list";
import { AddAdminDialog } from "@/app/(protected)/(superadmin)/administrators/_components/add-admin-dialog";
import { PageHeader } from "@sentinel/ui";
import { useUsersQuery } from "@/hooks/query/users/use-users-query";
import { Loader2 } from "lucide-react";
import { AdminUser } from "@sentinel/shared/types";

export default function SuperadminAdministratorsPage() {
    const { data: users, isLoading, error } = useUsersQuery();

    // Filter for administrators/superadmins
    const administrators = (users || []).filter(
        (u) => u.role === 'admin' || u.role === 'superadmin'
    ) as unknown as AdminUser[];

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Administrator Management"
                description="Manage system administrators and their institutional access."
            >
                <AddAdminDialog />
            </PageHeader>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load administrators.</p>
                    <p className="text-muted-foreground text-sm">Please ensure the API is reachable.</p>
                </div>
            ) : (
                <AdministratorsList administrators={administrators} />
            )}
        </div>
    );
}
