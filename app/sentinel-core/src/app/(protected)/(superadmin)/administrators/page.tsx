"use client";

import { useUsersQuery } from "@sentinel/hooks";
import { AddAdminDialog, AdministratorsList } from "@/app/(protected)/(superadmin)/administrators/_components";
import { PageHeader } from "@sentinel/ui";
import { Loader2 } from "lucide-react";
import { AdminUser } from "@sentinel/shared/types";
import { Separator } from "@sentinel/ui";

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

            <Separator/>
            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load administrators.</p>
                    <p className="text-muted-foreground text-sm">Please ensure the API is reachable.</p>
                </div>
            ) : (
                <div className="relative">
                    <AdministratorsList administrators={administrators} isLoading={isLoading} />

                    {isLoading && administrators.length === 0 && (
                        <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center rounded-md bg-background/80">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
