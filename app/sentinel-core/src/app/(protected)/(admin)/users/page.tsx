"use client";

import { UserManagementTable, AddUserDialog, BulkUploadDialog } from "@/app/(protected)/(admin)/users/_components";
import { PageHeader } from "@/components/common";
import { useUsersQuery } from "@/hooks/query/users/use-users-query";
import { usePresence } from "@/hooks/use-presence";
import { Loader2 } from "lucide-react";

export default function UserManagementPage() {
    const { data: users, isLoading, error } = useUsersQuery();
    const { onlineUserIds } = usePresence();

    if (error) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader
                    title="User Management"
                    description="Manage system access, roles, and account status."
                />
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load users.</p>
                    <p className="text-muted-foreground text-sm">Please ensure the API is reachable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="User Management"
                description="Manage system access, roles, and account status."
            >
                <div className="flex items-center gap-2">
                    <BulkUploadDialog />
                    <AddUserDialog />
                </div>
            </PageHeader>
            
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <UserManagementTable users={users || []} onlineUserIds={onlineUserIds} />
            )}
        </div>
    );
}


