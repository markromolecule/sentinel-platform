"use client";

import { DataTable } from "@sentinel/ui";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/departments/_components/columns";

// interface for the departments list
interface DepartmentsListProps {
    departments: Department[];
}

export function DepartmentsList({ departments }: DepartmentsListProps) {
    return (
        <DataTable
            columns={columns}
            data={departments}
            searchKey="name"
            searchPlaceholder="Search departments..."
            facets={[]}
        />
    );
}
