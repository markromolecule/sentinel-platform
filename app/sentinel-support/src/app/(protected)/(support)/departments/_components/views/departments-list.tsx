"use client";

import { useInstitutionsQuery } from "@sentinel/hooks";
import { DataTable } from "@sentinel/ui";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(support)/departments/_components/tables/columns";
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
    const { data: institutions = [] } = useInstitutionsQuery();

    const facets = [
        {
            columnKey: "institution",
            title: "Institution",
            options: institutions.map((institution) => ({
                label: institution.name,
                value: institution.name,
            })),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={departments}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search departments or institutions..."
            facets={facets}
            isLoading={isLoading}
            emptyContent={<DepartmentsEmptyState searchTerm={searchTerm} />}
        />
    );
}
