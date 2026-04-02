"use client";

import { ReactNode } from "react";
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useInstitutionsQuery,
} from "@sentinel/hooks";
import { DataTable } from "@sentinel/ui";
import { StudentWhitelist } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(admin)/users/whitelist/_components/tables/columns";
import { StudentWhitelistEmptyState } from "./student-whitelist-empty-state";
import { buildStudentWhitelistFacets } from "./student-whitelist-facets";

interface StudentWhitelistListProps {
    records: StudentWhitelist[];
    search?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
    showInstitution?: boolean;
    toolbarActions?: ReactNode;
}

export function StudentWhitelistList({
    records,
    search,
    onSearchChange,
    isLoading = false,
    showInstitution = false,
    toolbarActions,
}: StudentWhitelistListProps) {
    const { data: institutions = [] } = useInstitutionsQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();

    return (
        <DataTable
            columns={columns}
            data={records}
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search student numbers or names..."
            facets={buildStudentWhitelistFacets({
                institutions,
                departments,
                courses,
            })}
            isLoading={isLoading}
            toolbarActions={toolbarActions}
            initialColumnVisibility={{
                institutionId: showInstitution,
            }}
            emptyContent={<StudentWhitelistEmptyState search={search} />}
        />
    );
}
