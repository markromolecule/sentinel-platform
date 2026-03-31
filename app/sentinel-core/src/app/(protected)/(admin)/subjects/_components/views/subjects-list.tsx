"use client";

import { DataTable } from "@sentinel/ui";
import { type ColumnDef } from "@tanstack/react-table";
import { type MasterSubject } from "@sentinel/shared/types";
import { columns as defaultColumns } from "@/app/(protected)/(admin)/subjects/_components/tables/columns";
import { SubjectsEmptyState } from "./subjects-empty-state";

type SubjectsListProps = {
    subjects: MasterSubject[];
    columns?: ColumnDef<MasterSubject>[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
};

export function SubjectsList({
    subjects,
    columns = defaultColumns,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: SubjectsListProps) {
    return (
        <DataTable
            columns={columns}
            data={subjects}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search subjects..."
            isLoading={isLoading}
            emptyContent={<SubjectsEmptyState searchTerm={searchTerm} />}
        />
    );
}
