'use client';

import { useCoursesQuery } from '@sentinel/hooks';
import { AdminUser } from '@sentinel/shared/types';

interface AdministratorCourseCellProps {
    administrator: AdminUser;
}

export function AdministratorCourseCell({ administrator }: AdministratorCourseCellProps) {
    const { data: courses = [] } = useCoursesQuery();

    const courseIds = administrator.courseIds?.length
        ? administrator.courseIds
        : administrator.courseId
          ? [administrator.courseId]
          : [];

    if (courseIds.length === 0) {
        return <span className="text-muted-foreground">Unassigned</span>;
    }

    const courseCodes = courseIds
        .map((courseId) => courses.find((course) => course.id === courseId)?.code)
        .filter((code): code is string => Boolean(code));

    if (courseCodes.length === 0) {
        return <span className="text-muted-foreground">Unknown Course</span>;
    }

    return <div>{courseCodes.join(', ')}</div>;
}
