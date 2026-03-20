"use client";

import { DataTable } from "@sentinel/ui";
import { AdminUser } from "@sentinel/shared/types";
import { columns } from "./columns";

interface AdministratorsListProps {
    administrators: AdminUser[];
}

export function AdministratorsList({ administrators }: AdministratorsListProps) {
    return (
        <DataTable
            columns={columns}
            data={administrators}
            searchKey="email"
            searchPlaceholder="Search administrators by email..."
            facets={[]}
        />
    );
}
