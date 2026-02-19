"use client";

import { useCourseStore } from "@/stores/use-course-store";
import { DataTable } from "@/components/ui/data-table/data-table";
import { PageHeader } from "@/components/common";
import { columns, AddCourseDialog } from "./_components";

export default function AdminCoursesPage() {
     const courses = useCourseStore((state) => state.courses);

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
                              options: [
                                   { label: "SECA", value: "School of Engineering, Computing, and Architecture" },
                                   { label: "SBMA", value: "School of Business, Management, and Accountancy" },
                                   { label: "SASE", value: "School of Arts, Sciences, and Education" },
                                   { label: "General Education", value: "General Education" },
                              ]
                         }
                    ]}
               />
          </div>
     );
}

