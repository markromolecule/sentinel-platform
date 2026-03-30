"use client";

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useSectionsQuery
} from "@sentinel/hooks";
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
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    const facets = [
        {
            columnKey: "departmentIds",
            title: "Department",
            options: departments.map((department) => ({
                label: department.code || department.name,
                value: department.id,
            })),
        },
        {
            columnKey: "courseIds",
            title: "Course",
            options: courses.map((course) => ({
                label: course.code || course.title,
                value: course.id,
            })),
        },
        {
            columnKey: "yearLevels",
            title: "Year Level",
            options: [1, 2, 3, 4, 5].map((level) => ({
                label: `Year ${level}`,
                value: String(level),
            })),
        },
        {
            columnKey: "sectionIds",
            title: "Section",
            options: sections.map((section) => ({
                label: section.name,
                value: section.id,
            })),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={subjects}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search subjects..."
            facets={facets}
            emptyContent={isLoading ? <div className="h-32" /> : <SubjectsEmptyState searchTerm={searchTerm} />}
        />
    );
}
