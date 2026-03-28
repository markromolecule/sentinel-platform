"use client";

import { User } from '@sentinel/shared/types';
import { useUserManagement } from "@/app/(protected)/(admin)/users/_hooks/use-user-management";
import {
    DataTable,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@sentinel/ui";
import { columns } from "@/app/(protected)/(admin)/users/_components/columns";
import { EditUserDialog } from "@/app/(protected)/(admin)/users/_components/edit-user-dialog";
import { Loader2 } from "lucide-react";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useState } from "react";

interface UserManagementTableProps {
    users: User[];
    onlineUserIds: Set<string>;
    hideColumns?: string[];
    search?: string;
    onSearchChange?: (value: string) => void;
}

export function UserManagementTable({
    users,
    onlineUserIds,
    hideColumns = [],
}: UserManagementTableProps) {
    const [currentTab] = useState("all");

    const {
        editingUser,
        setEditingUser,
        handleDeleteUser,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        userToDelete,
        confirmDelete,
        isDeleting,
    } = useUserManagement();

    // Filter by role (tab)
    const roleFilteredUsers = users.filter((user) => {
        if (currentTab === "all") return true;
        return user.role === currentTab;
    });

    const { data: departments } = useDepartmentsQuery();

    const departmentOptions = departments?.map(dept => ({
        label: dept.name,
        value: dept.name,
    })) || [];

    const userColumns = columns(setEditingUser, handleDeleteUser, onlineUserIds).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (col) => !hideColumns.includes((col as any).accessorKey || col.id)
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={userColumns}
                data={roleFilteredUsers}
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
                    {
                        columnKey: "department",
                        title: "Department",
                        options: departmentOptions,
                    },
                ]}
            />

            <EditUserDialog
                user={editingUser}
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the account for{" "}
                            <span className="font-semibold">{userToDelete?.email}</span> and remove all
                            associated data from the system. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
