"use client";

import { useCoursesQuery, useDepartmentsQuery } from "@sentinel/hooks";
import { DataTable } from "@sentinel/ui";
import { type Section } from '@sentinel/shared/types';
import { columns } from "@/app/(protected)/(admin)/sections/_components/tables/columns";
import { SectionsEmptyState } from "./sections-empty-state";

interface SectionsListProps {
    sections: Section[];
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function SectionsList({
     sections,
     searchTerm,
     onSearchChange,
     isLoading = false,
}: SectionsListProps) {
     const { data: departments = [] } = useDepartmentsQuery();
     const { data: courses = [] } = useCoursesQuery();

     const facets = [
          {
               columnKey: "departmentId",
               title: "Department",
               options: departments.map(dept => ({
                    label: dept.code || dept.name,
                    value: dept.id
               }))
          },
          {
               columnKey: "courseId",
               title: "Course",
               options: courses.map(course => ({
                    label: course.code || course.title,
                    value: course.id
               }))
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
               ]
          },
     ];

     return (
          <DataTable
               columns={columns}
               data={sections}
               searchValue={searchTerm}
               onSearchChange={onSearchChange}
               searchPlaceholder="Search sections..."
               facets={facets}
               emptyContent={isLoading ? <div className="h-32" /> : <SectionsEmptyState searchTerm={searchTerm} />}
          />
     );
}
