"use client";

import { UserManagementTable, AddUserDialog, BulkUploadDialog } from "@/app/(protected)/(admin)/users/_components";
import { PageHeader } from "@/components/common";
import { useUsersQuery } from "@/hooks/query/users/use-users-query";
import { usePresence } from "@/hooks/use-presence";
import { MOCK_ADMIN_USERS as MOCK_USERS } from '@sentinel/shared/mock-data';
import { Loader2 } from "lucide-react";

export default function UserManagementPage() {
    const { data: users, isLoading, error } = useUsersQuery();
    const { onlineUserIds } = usePresence();

    const displayUsers = error || !users ? MOCK_USERS : users;

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
                <UserManagementTable users={displayUsers} onlineUserIds={onlineUserIds} />
            )}
        </div>
    );
}


