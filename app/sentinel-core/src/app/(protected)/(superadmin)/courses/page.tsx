"use client";

import { useState } from "react";
import { useDebounce } from "@sentinel/hooks";
import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";
import { PageHeader, Separator } from "@sentinel/ui";
import { AddCourseDialog } from "@/app/(protected)/(superadmin)/courses/_components";
import { CourseList } from "@/app/(protected)/(superadmin)/courses/_components/course-list";

export default function AdminCoursesPage() {
     const [searchTerm, setSearchTerm] = useState("");
     const debouncedSearch = useDebounce(searchTerm, 500);

     const { data: courses = [], isLoading, isError } = useCoursesQuery(debouncedSearch);

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title="Course Management"
                    description="Manage academic programs and courses."
               >
                    <AddCourseDialog />
               </PageHeader>
               <Separator />

               <div className="relative">
                    {/* Always render CourseList to keep search bar mounted and focused */}
                    <CourseList
                         courses={courses}
                         searchTerm={searchTerm}
                         onSearchChange={setSearchTerm}
                    />

                    {/* Subtle loading overlay only for initial empty state */}
                    {isLoading && courses.length === 0 && (
                         <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/80 z-10 rounded-md">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                         </div>
                    )}

                    {isError && (
                         <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                              Error loading courses. Please try again.
                         </div>
                    )}
               </div>
          </div>
     );
}

