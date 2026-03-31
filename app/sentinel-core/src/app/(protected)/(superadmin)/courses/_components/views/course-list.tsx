"use client";

import { useDepartmentsQuery } from "@sentinel/hooks";
import { DataTable } from "@sentinel/ui";
import { type Course } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(superadmin)/courses/_components/tables/columns";
import { CoursesEmptyState } from "./courses-empty-state";

interface CourseListProps {
    courses: Course[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function CourseList({
    courses,
    searchTerm,
    onSearchChange,
    isLoading = false,
}: CourseListProps) {
    const { data: departments = [] } = useDepartmentsQuery();

    const facets = [
        {
            columnKey: "department",
            title: "Department",
            options: departments.map(dept => ({
                label: dept.code || dept.name,
                value: dept.id
            }))
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={courses}
            facets={facets}
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search courses..."
            isLoading={isLoading}
            emptyContent={<CoursesEmptyState searchTerm={searchTerm} />}
        />
    );
}
