"use client";

import { DataTable } from "@sentinel/ui";
import { AdminUser } from "@sentinel/shared/types";
import { columns } from "./columns";

interface AdministratorsListProps {
    administrators: AdminUser[];
}

export function AdministratorsList({ administrators }: AdministratorsListProps) {
    const facets = [
        {
            columnKey: "role",
            title: "Role",
            options: [
                { label: "Super Admin", value: "superadmin" },
                { label: "Admin", value: "admin" },
            ],
        },
        {
            columnKey: "status",
            title: "Status",
            options: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
            ],
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={administrators}
            searchKey="email"
            searchPlaceholder="Search administrators by email..."
            facets={facets}
        />
    );
}
