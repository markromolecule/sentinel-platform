import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDepartmentsQuery, useCoursesQuery, useProfileQuery } from '@sentinel/hooks';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';

const EMPTY_ARRAY: string[] = [];

export function useClassificationOptions() {
    const { control } = useFormContext<SubjectClassificationFormValues>();

    const selectedDeptId = useWatch({
        control,
        name: 'department_id',
    });

    const selectedCourseIds =
        useWatch({
            control,
            name: 'course_ids',
        }) ?? EMPTY_ARRAY;

    const { profile, isLoading: isLoadingProfile } = useProfileQuery();
    const { data: deptData, isLoading: isLoadingDepts } = useDepartmentsQuery();
    const { data: courseData, isLoading: isLoadingCourses } = useCoursesQuery();

    const isAdmin = profile?.role === 'admin';

    const deptOptions = useMemo(
        () =>
            deptData?.map((dept) => ({
                value: dept.department_id ?? dept.id,
                label: dept.department_name ?? dept.name,
            })) ?? [],
        [deptData],
    );

    const filteredCourseOptions = useMemo(() => {
        if (!courseData || !selectedDeptId) return [];
        return courseData
            .filter((course) => (course.department_id ?? course.departmentId) === selectedDeptId)
            .map((course) => ({
                value: course.course_id ?? course.id,
                label: `${course.code} - ${course.title}`,
            }));
    }, [courseData, selectedDeptId]);

    const courseSummary = useMemo(() => {
        if (selectedCourseIds.length === 0) return 'No courses assigned';
        if (selectedCourseIds.length === 1) {
            const course = courseData?.find((c) => (c.course_id ?? c.id) === selectedCourseIds[0]);
            return course ? course.title : '1 course assigned';
        }
        return `${selectedCourseIds.length} courses assigned`;
    }, [selectedCourseIds, courseData]);

    return {
        profile,
        isAdmin,
        deptOptions,
        filteredCourseOptions,
        courseSummary,
        isLoading: isLoadingProfile || isLoadingDepts || isLoadingCourses,
        isLoadingCourses,
        isLoadingDepts,
    };
}
