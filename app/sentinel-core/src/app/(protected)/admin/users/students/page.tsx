"use client";

import { UserManagementTable } from "@/app/(protected)/admin/users/_components";
import { MOCK_ADMIN_USERS as MOCK_USERS } from '@sentinel/shared/mock-data';
import { AddUserDialog } from "@/app/(protected)/admin/users/_components/add-user-dialog";
import { PageHeader } from "@/components/common";
import { useUsersQuery } from "@/hooks/query/users/use-users-query";
import { usePresence } from "@/hooks/use-presence";
import { Loader2 } from "lucide-react";

export default function StudentsManagementPage() {
    const { data: users, isLoading, error } = useUsersQuery();
    const { onlineUserIds } = usePresence();

    const displayUsers = (error || !users ? MOCK_USERS : users).filter(
        (u) => u.role === 'student'
    );

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Students Management"
                description="Manage student accounts, enrollments, and system access."
            >
                <AddUserDialog />
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
