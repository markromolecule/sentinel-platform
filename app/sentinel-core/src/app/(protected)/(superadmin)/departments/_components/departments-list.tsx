"use client";

import { DataTable } from "@sentinel/ui";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/departments/_components/columns";

// interface for the departments list
interface DepartmentsListProps {
    departments: Department[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

export function DepartmentsList({ departments, searchTerm, onSearchChange }: DepartmentsListProps) {
    return (
        <DataTable
            columns={columns}
            data={departments}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search departments..."
            facets={[]}
        />
    );
}
