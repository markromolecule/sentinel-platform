"use client";

import { usePresence, useUsersQuery } from "@sentinel/hooks";
import { AddUserDialog, UserManagementTable } from "@/app/(protected)/(admin)/users/_components";
import { PageHeader } from "@sentinel/ui";
import { Loader2 } from "lucide-react";

export default function ProctorsManagementPage() {
    const { data: users, isLoading, error } = useUsersQuery();
    const { onlineUserIds } = usePresence();

    if (error) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4">
                <PageHeader
                    title="Instructors Management"
                    description="Manage instructors and their academic access."
                />
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load instructors.</p>
                    <p className="text-muted-foreground text-sm">Please ensure the API is reachable.</p>
                </div>
            </div>
        );
    }

    const displayUsers = (users || []).filter(
        (u) => u.role === 'instructor'
    );

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Instructors Management"
                description="Manage instructors and their academic access."
            >
                <AddUserDialog />
            </PageHeader>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <UserManagementTable users={displayUsers} onlineUserIds={onlineUserIds} hideColumns={["studentNo"]} />
            )}
        </div>
    );
}
