"use client";

import { useDebounce, usePresence, useUsersQuery } from "@sentinel/hooks";
import { useState } from "react";
import { UserManagementTable, AddUserDialog, BulkUploadDialog } from "@/app/(protected)/(admin)/users/_components";
import { PageHeader, Separator } from "@sentinel/ui";
import { Loader2 } from "lucide-react";

export default function UserManagementPage() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const { data: users = [], isLoading, error } = useUsersQuery({ search: debouncedSearch });
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
            <Separator />
            <div className="relative">
                <UserManagementTable
                    users={users}
                    onlineUserIds={onlineUserIds}
                    search={search}
                    onSearchChange={setSearch}
                    isLoading={isLoading}
                />

                {isLoading && users.length === 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center rounded-md bg-background/80">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}

