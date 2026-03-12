"use client";

import { User } from '@sentinel/shared/types';;
import { useUserManagement } from "@/app/(protected)/admin/users/_hooks/use-user-management";
import { DataTable } from "@sentinel/ui";
import { columns } from "@/app/(protected)/admin/users/_components/columns";
import { EditUserDialog } from "@/app/(protected)/admin/users/_components/edit-user-dialog";

interface UserManagementTableProps {
    users: User[];
    onlineUserIds: Set<string>;
    hideColumns?: string[];
}

export function UserManagementTable({ users, onlineUserIds, hideColumns = [] }: UserManagementTableProps) {

    const {
        filteredUsers,
        editingUser,
        setEditingUser,
        handleDeleteUser,
    } = useUserManagement({ users });

    const userColumns = columns(setEditingUser, handleDeleteUser, onlineUserIds).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (col) => !hideColumns.includes((col as any).accessorKey || col.id)
    );


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
                            { label: "Offline", value: "offline" },
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
