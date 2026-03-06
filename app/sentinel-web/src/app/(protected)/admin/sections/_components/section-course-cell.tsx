"use client";

import { useCoursesQuery } from "@/hooks/query/courses/use-courses-query";

interface SectionCourseCellProps {
    courseId?: string;
}

export const SectionCourseCell = ({ courseId }: SectionCourseCellProps) => {
    const { data: courses = [] } = useCoursesQuery();

    if (!courseId) {
        return <span className="text-muted-foreground">None</span>;
    }

    const course = courses.find((c) => c.id === courseId);

    return (
        <div className="font-medium">
            {course?.code || "Unknown Course"}
        </div>
    );
};
