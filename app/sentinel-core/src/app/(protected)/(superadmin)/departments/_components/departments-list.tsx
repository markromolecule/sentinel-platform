"use client";

import { DataTable, EmptyState } from "@sentinel/ui";
import { type Department } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(superadmin)/departments/_components/columns";
import { AddDepartmentDialog } from "@/app/(protected)/(superadmin)/departments/_components/add-department-dialog";

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
            emptyContent={
                <EmptyState
                    icon="🏢"
                    title={searchTerm ? "No results found" : "No departments added"}
                    description={
                        searchTerm
                            ? `We couldn't find any departments matching "${searchTerm}".`
                            : "Add departments to the institution to start managing them."
                    }
                    action={!searchTerm && <AddDepartmentDialog />}
                />
            }
        />
    );
}
