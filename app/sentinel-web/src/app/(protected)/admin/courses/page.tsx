"use client";

import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { DataTable } from "@/components/ui/data-table/data-table";
import { PageHeader } from "@/components/common";
import { columns, AddCourseDialog } from "@/app/(protected)/admin/courses/_components";
import { Department } from "@sentinel/shared/types";

export default function AdminCoursesPage() {
     const { data: courses = [], isLoading, isError } = useCoursesQuery();
     const { data: departments = [] } = useDepartmentsQuery();

     if (isLoading) {
          return (
               <div className="flex flex-col gap-6 md:p-6 p-4">
                    <PageHeader title="Course Management" description="Manage academic programs and courses." />
                    <div className="flex h-48 items-center justify-center">
                         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
               </div>
          );
     }

     if (isError) {
          return (
               <div className="flex flex-col gap-6 md:p-6 p-4">
                    <PageHeader title="Course Management" description="Manage academic programs and courses." />
                    <div className="flex h-48 items-center justify-center text-destructive">
                         Error loading courses. Please try again.
                    </div>
               </div>
          );
     }

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title="Course Management"
                    description="Manage academic programs and courses."
               >
                    <AddCourseDialog />
               </PageHeader>
               <DataTable
                    columns={columns}
                    data={courses}
                    searchKey="code"
                    facets={[
                         {
                              columnKey: "department",
                              title: "Department",
                              options: departments.map((dept: Department) => ({
                                   label: dept.code || "Unknown",
                                   value: dept.id,
                              })),
                         }
                    ]}
               />
          </div>
     );
}

