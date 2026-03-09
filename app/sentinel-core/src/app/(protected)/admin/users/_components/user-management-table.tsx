"use client";

import { User } from '@sentinel/shared/types';;
import { useUserManagement } from "@/app/(protected)/admin/users/_hooks/use-user-management";
import { DataTable } from "@sentinel/ui";
import { columns } from "@/app/(protected)/admin/users/_components/columns";
import { EditUserDialog } from "@/app/(protected)/admin/users/_components/edit-user-dialog";

interface UserManagementTableProps {
    users: User[];
}

export function UserManagementTable({ users }: UserManagementTableProps) {
    const {
        filteredUsers,
        editingUser,
        setEditingUser,
    } = useUserManagement({ users });

    const userColumns = columns(setEditingUser);

    return (
        <div className="space-y-4">
            <DataTable
                columns={userColumns}
                data={filteredUsers}
                searchKey="email"
                searchPlaceholder="Filter emails..."
                facets={[
                    {
                        columnKey: "role",
                        title: "Role",
                        options: [
                            { label: "Admin", value: "admin" },
                            { label: "Proctor", value: "proctor" },
                            { label: "Instructor", value: "instructor" },
                            { label: "Student", value: "student" },
                        ],
                    },
                    {
                        columnKey: "status",
                        title: "Status",
                        options: [
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Suspended", value: "suspended" },
                            { label: "Archived", value: "archived" },
                        ],
                    },
                ]}
            />

            <EditUserDialog
                user={editingUser}
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
            />
        </div>
    );
}
