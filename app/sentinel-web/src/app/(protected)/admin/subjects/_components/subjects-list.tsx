"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { type MasterSubject } from "@sentinel/shared/types";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useSectionsQuery } from "@/hooks/query/sections/use-sections-query";
import { columns as defaultColumns } from "./columns";

type SubjectsListProps = {
    subjects: MasterSubject[];
    columns?: ColumnDef<MasterSubject>[];
};

export function SubjectsList({ subjects, columns = defaultColumns }: SubjectsListProps) {
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
            searchKey="title"
            searchPlaceholder="Search subjects..."
            facets={facets}
        />
    );
}
