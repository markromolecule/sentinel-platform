"use client";

import { usePresence, useUsersQuery } from "@sentinel/hooks";
import { UserManagementTable } from "@/app/(protected)/(admin)/users/_components";
import { AddStudentWhitelistDialog } from "@/app/(protected)/(admin)/users/whitelist/_components/dialogs/add-student-whitelist-dialog";
import { PageHeader } from "@sentinel/ui";
import { Loader2, UserPlus } from "lucide-react";

export default function StudentsManagementPage() {
    const { data: users, isLoading, error } = useUsersQuery({ role: 'student' });
    const { onlineUserIds } = usePresence();

    if (error) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader
                    title="Students Management"
                    description="Manage student accounts, enrollments, and system access."
                />
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load students.</p>
                    <p className="text-muted-foreground text-sm">Please ensure the API is reachable.</p>
                </div>
            </div>
        );
    }

    const displayUsers = (users || []).filter(
        (u) => u.role === 'student'
    );

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Students Management"
                description="Manage student accounts, enrollments, and system access."
            >
                <AddStudentWhitelistDialog
                    triggerLabel="Add User"
                    triggerIcon={<UserPlus className="mr-2 h-4 w-4" />}
                />
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
