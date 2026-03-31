"use client";

import { Semester } from "@sentinel/shared/types";
import { DataTable } from "@sentinel/ui";
import { columns } from "@/app/(protected)/(superadmin)/semesters/_components/tables/columns";
import { SemestersEmptyState } from "@/app/(protected)/(superadmin)/semesters/_components/views/semesters-empty-state";

interface SemestersListProps {
    semesters: Semester[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function SemestersList({
    semesters,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: SemestersListProps) {
    return (
        <DataTable
            columns={columns}
            data={semesters}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search academic year or semester..."
            isLoading={isLoading}
            emptyContent={<SemestersEmptyState searchTerm={searchTerm} />}
        />
    );
}
