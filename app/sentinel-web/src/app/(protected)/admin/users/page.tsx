"use client";

import { UserManagementTable } from "@/app/(protected)/admin/users/_components";
import { ConstantsAdmin_MOCK_ADMIN_USERS as MOCK_USERS } from '@sentinel/shared/constants';;
import { AddUserDialog } from "@/app/(protected)/admin/users/_components/add-user-dialog";
import { PageHeader } from "@/components/common";

export default function UserManagementPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="User Management"
                description="Manage system access, roles, and account status."
            >
                <AddUserDialog />
            </PageHeader>
            <UserManagementTable users={MOCK_USERS} />
        </div>
    );
}

