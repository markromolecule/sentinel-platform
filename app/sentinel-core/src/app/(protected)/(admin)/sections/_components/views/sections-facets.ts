"use client";

import { type DataTableFacet } from "@sentinel/ui";

type SectionsFacetsArgs = {
    departments: Array<{ id: string; name: string; code?: string | null }>;
    courses: Array<{ id: string; title: string; code?: string | null }>;
};

export function buildSectionsFacets({
    departments,
    courses,
}: SectionsFacetsArgs): DataTableFacet[] {
    return [
        {
            columnKey: "departmentId",
            title: "Department",
            options: departments.map((department) => ({
                label: department.code || department.name,
                value: department.id,
            })),
        },
        {
            columnKey: "courseId",
            title: "Course",
            options: courses.map((course) => ({
                label: course.code || course.title,
                value: course.id,
            })),
        },
        {
            columnKey: "yearLevel",
            title: "Year Level",
            options: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5", value: "5" },
            ],
        },
    ];
}
