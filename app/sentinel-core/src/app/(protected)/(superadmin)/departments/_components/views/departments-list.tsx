"use client";

import { DataTable } from "@sentinel/ui";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/departments/_components/tables/columns";
import { DepartmentsEmptyState } from "./departments-empty-state";

// interface for the departments list
interface DepartmentsListProps {
    departments: Department[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function DepartmentsList({
    departments,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: DepartmentsListProps) {
    return (
        <DataTable
            columns={columns}
            data={departments}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search departments..."
            facets={[]}
            isLoading={isLoading}
            emptyContent={<DepartmentsEmptyState searchTerm={searchTerm} />}
        />
    );
}
