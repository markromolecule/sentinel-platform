"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/admin/departments/_components/columns";

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
            facets={[
                {
                    columnKey: "status",
                    title: "Status",
                    options: [
                        {
                            label: "Active",
                            value: "Active"
                        },
                        {
                            label: "Inactive",
                            value: "Inactive"
                        },
                    ],
                },
            ]}
        />
    );
}
