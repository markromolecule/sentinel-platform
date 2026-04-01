"use client";

import { useInstitutionsQuery } from "@sentinel/hooks";
import { Semester } from "@sentinel/shared/types";
import { DataTable } from "@sentinel/ui";
import { columns } from "@/app/(protected)/(superadmin)/semesters/_components/tables/columns";
import { SemestersEmptyState } from "@/app/(protected)/(superadmin)/semesters/_components/views/semesters-empty-state";
import { SEMESTER_OPTIONS } from "@/app/(protected)/(superadmin)/semesters/_components/dialogs/constants";

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
        {
            columnKey: "semester",
            title: "Semester",
            options: SEMESTER_OPTIONS.map((semester) => ({
                label: semester,
                value: semester,
            })),
        },
        {
            columnKey: "status",
            title: "Status",
            options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
            ],
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={semesters}
            facets={facets}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search institution, academic year, or semester..."
            isLoading={isLoading}
            emptyContent={<SemestersEmptyState searchTerm={searchTerm} />}
        />
    );
}
