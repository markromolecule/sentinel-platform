"use client";

import { DataTable } from "@sentinel/ui";
import { type Course } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(superadmin)/courses/_components/columns";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";

interface CourseListProps {
    courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
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
            searchKey="department"
            searchPlaceholder="Search courses..."
            facets={facets}
        />
    );
}
