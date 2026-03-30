"use client";

import { useDepartmentsQuery } from "@sentinel/hooks";
import { DataTable, EmptyState } from "@sentinel/ui";
import { type Course } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(superadmin)/courses/_components/columns";
import { AddCourseDialog } from "@/app/(protected)/(superadmin)/courses/_components/add-course-dialog";

interface CourseListProps {
    courses: Course[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
}

export function CourseList({ courses, searchTerm, onSearchChange }: CourseListProps) {
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
            emptyContent={
                <EmptyState
                    icon="📚"
                    title={searchTerm ? "No results found" : "No courses added"}
                    description={
                        searchTerm
                            ? `We couldn't find any courses matching "${searchTerm}".`
                            : "Add courses to the system to start managing academic programs."
                    }
                    action={!searchTerm && <AddCourseDialog />}
                />
            }
        />
    );
}
