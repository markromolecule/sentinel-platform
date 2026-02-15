"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { type Section } from "../_types";
import { columns } from "./columns";

interface SectionsListProps {
     sections: Section[];
}

import { useCourseStore } from "@/stores/use-course-store";

export function SectionsList({ sections }: SectionsListProps) {
     const courses = useCourseStore((state) => state.courses);

     const facets = [
          {
               columnKey: "courseId",
               title: "Course",
               options: courses.map(course => ({
                    label: course.code,
                    value: course.id
               }))
          },
          {
               columnKey: "yearLevel",
               title: "Year Level",
               options: [
                    { label: "1st Year", value: "1st Year" },
                    { label: "2nd Year", value: "2nd Year" },
                    { label: "3rd Year", value: "3rd Year" },
                    { label: "4th Year", value: "4th Year" },
               ]
          },
          {
               columnKey: "status",
               title: "Status",
               options: [
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Archived", value: "archived" },
               ]
          }
     ];

     return (
          <DataTable
               columns={columns}
               data={sections}
               searchKey="name"
               searchPlaceholder="Search sections..."
               facets={facets}
          />
     );
}
