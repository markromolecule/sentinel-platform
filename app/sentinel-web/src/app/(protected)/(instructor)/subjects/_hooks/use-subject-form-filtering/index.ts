'use client';

import { useMemo, useCallback } from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useSectionsQuery,
    useSubjectsQuery,
} from '@sentinel/hooks';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

export function useSubjectFormFiltering(
    form: UseFormReturn<InstructorSubjectEnrollmentFormValues>,
) {
    // 1. Data fetching
    const { data: mainSubjects = [] } = useSubjectsQuery();
    const { data: allDepartments = [] } = useDepartmentsQuery();
    const { data: allCourses = [] } = useCoursesQuery();
    const { data: allSections = [] } = useSectionsQuery();

    // 2. Form watching
    const selectedSubjectCode = useWatch({ control: form.control, name: 'subject_code' });
    const selectedDepartmentId = useWatch({ control: form.control, name: 'department_id' });
    const selectedCourseId = useWatch({ control: form.control, name: 'course_id' });
    const selectedYearLevel = useWatch({ control: form.control, name: 'year_level' });
    const watchedSectionIds = useWatch({ control: form.control, name: 'section_ids' });
    const selectedSectionIds = useMemo(() => watchedSectionIds ?? [], [watchedSectionIds]);

    // 3. Derived computations (Memoized)
    const activeSubject = useMemo(
        () => mainSubjects.find((s) => s.code === selectedSubjectCode),
        [mainSubjects, selectedSubjectCode],
    );

    const validDepartments = useMemo(() => {
        if (!activeSubject) return [];
        const allowedIds = new Set(activeSubject.departmentIds ?? []);
        return allDepartments.filter((d) => allowedIds.has(d.id));
    }, [activeSubject, allDepartments]);

    const validCourses = useMemo(() => {
        if (!activeSubject) return [];
        const allowedIds = new Set(activeSubject.courseIds ?? []);
        return allCourses.filter((c) => allowedIds.has(c.id));
    }, [activeSubject, allCourses]);

    const validYearLevels = useMemo(() => activeSubject?.yearLevels ?? [], [activeSubject]);

    const validSections = useMemo(() => {
        if (!activeSubject) return [];

        const allowedSectionIds = new Set(activeSubject.sectionIds ?? []);

        return allSections.filter((section) => {
            if (!allowedSectionIds.has(section.id)) return false;

            const matchesDepartment =
                !selectedDepartmentId || section.departmentId === selectedDepartmentId;
            const matchesCourse = !selectedCourseId || section.courseId === selectedCourseId;
            const matchesYear =
                !selectedYearLevel || section.yearLevel === Number(selectedYearLevel);

            return matchesDepartment && matchesCourse && matchesYear;
        });
    }, [activeSubject, allSections, selectedDepartmentId, selectedCourseId, selectedYearLevel]);

    // 4. Form handlers
    const toggleSection = useCallback(
        (sectionId: string) => {
            const next = selectedSectionIds.includes(sectionId)
                ? selectedSectionIds.filter((value) => value !== sectionId)
                : [...selectedSectionIds, sectionId];

            form.setValue('section_ids', next, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [selectedSectionIds, form],
    );

    const toggleAllSections = useCallback(
        (sectionIdsToToggle: string[], checked: boolean) => {
            let next: string[];

            if (checked) {
                next = Array.from(new Set([...selectedSectionIds, ...sectionIdsToToggle]));
            } else {
                const toRemove = new Set(sectionIdsToToggle);
                next = selectedSectionIds.filter((id) => !toRemove.has(id));
            }

            form.setValue('section_ids', next, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [selectedSectionIds, form],
    );

    const handleSubjectChange = useCallback(
        (val: string, fieldOnChange: (val: string) => void) => {
            fieldOnChange(val);
            // Reset downstream fields upon subject change
            form.setValue('department_id', '');
            form.setValue('course_id', '');
            form.setValue('year_level', 0);
            form.setValue('section_ids', []);
        },
        [form],
    );

    return {
        // Data
        mainSubjects,
        validDepartments,
        validCourses,
        validYearLevels,
        validSections,
        // Current values
        selectedSubjectCode,
        selectedDepartmentId,
        selectedCourseId,
        selectedYearLevel,
        selectedSectionIds,
        // Handlers
        toggleSection,
        toggleAllSections,
        handleSubjectChange,
    };
}
