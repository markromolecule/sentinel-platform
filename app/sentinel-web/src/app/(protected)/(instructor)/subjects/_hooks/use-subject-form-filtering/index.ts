'use client';

import { useMemo, useCallback } from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import {
    useCoursesQuery,
    useDepartmentsQuery,
    useSectionsQuery,
    useSubjectOfferingsQuery,
} from '@sentinel/hooks';
import { type InstructorSubjectEnrollmentFormValues } from '@sentinel/shared/schema';

export function useSubjectFormFiltering(
    form: UseFormReturn<InstructorSubjectEnrollmentFormValues>,
) {
    const { data: subjectOfferings = [] } = useSubjectOfferingsQuery();
    const { data: allDepartments = [] } = useDepartmentsQuery();
    const { data: allCourses = [] } = useCoursesQuery();
    const { data: allSections = [] } = useSectionsQuery();

    const selectedSubjectOfferingId = useWatch({
        control: form.control,
        name: 'subject_offering_id',
    });
    const selectedDepartmentId = useWatch({ control: form.control, name: 'department_id' });
    const selectedCourseId = useWatch({ control: form.control, name: 'course_id' });
    const selectedYearLevel = useWatch({ control: form.control, name: 'year_level' });
    const watchedSectionIds = useWatch({ control: form.control, name: 'section_ids' });
    const selectedSectionIds = useMemo(() => watchedSectionIds ?? [], [watchedSectionIds]);

    const availableOfferings = useMemo(
        () =>
            subjectOfferings.filter(
                (offering) =>
                    (offering.status === 'OPEN' || offering.status === 'DRAFT') &&
                    offering.sectionIds.length > 0,
            ),
        [subjectOfferings],
    );

    const activeOffering = useMemo(
        () => availableOfferings.find((offering) => offering.id === selectedSubjectOfferingId),
        [availableOfferings, selectedSubjectOfferingId],
    );

    const allowedSections = useMemo(() => {
        if (!activeOffering) {
            return [];
        }

        const allowedSectionIds = new Set(activeOffering.sectionIds ?? []);
        return allSections.filter((section) => allowedSectionIds.has(section.id));
    }, [activeOffering, allSections]);

    const validDepartments = useMemo(() => {
        if (!activeOffering) return [];
        const allowedIds =
            activeOffering.departmentIds.length > 0
                ? new Set(activeOffering.departmentIds)
                : new Set(
                      allowedSections
                          .map((section) => section.departmentId)
                          .filter((departmentId): departmentId is string => Boolean(departmentId)),
                  );

        return allDepartments.filter((d) => allowedIds.has(d.id));
    }, [activeOffering, allDepartments, allowedSections]);

    const validCourses = useMemo(() => {
        if (!activeOffering) return [];
        const allowedIds =
            activeOffering.courseIds.length > 0
                ? new Set(activeOffering.courseIds)
                : new Set(
                      allowedSections
                          .filter(
                              (section) =>
                                  !selectedDepartmentId ||
                                  section.departmentId === selectedDepartmentId,
                          )
                          .map((section) => section.courseId)
                          .filter((courseId): courseId is string => Boolean(courseId)),
                  );

        return allCourses.filter((course) => {
            if (!allowedIds.has(course.id)) {
                return false;
            }

            if (!selectedDepartmentId) {
                return true;
            }

            return (
                course.department === selectedDepartmentId || course.departmentId === selectedDepartmentId
            );
        });
    }, [activeOffering, allCourses, allowedSections, selectedDepartmentId]);

    const validYearLevels = useMemo(() => {
        if (!activeOffering) {
            return [];
        }

        if (activeOffering.yearLevels.length > 0) {
            return activeOffering.yearLevels;
        }

        return Array.from(
            new Set(
                allowedSections
                    .filter(
                        (section) =>
                            (!selectedDepartmentId || section.departmentId === selectedDepartmentId) &&
                            (!selectedCourseId || section.courseId === selectedCourseId) &&
                            section.yearLevel !== undefined,
                    )
                    .map((section) => section.yearLevel as number),
            ),
        ).sort((left, right) => left - right);
    }, [activeOffering, allowedSections, selectedCourseId, selectedDepartmentId]);

    const validSections = useMemo(() => {
        if (!activeOffering) return [];

        const allowedSectionIds = new Set(activeOffering.sectionIds ?? []);

        return allSections.filter((section) => {
            if (!allowedSectionIds.has(section.id)) return false;

            const matchesDepartment =
                !selectedDepartmentId || section.departmentId === selectedDepartmentId;
            const matchesCourse = !selectedCourseId || section.courseId === selectedCourseId;
            const matchesYear =
                !selectedYearLevel || section.yearLevel === Number(selectedYearLevel);

            return matchesDepartment && matchesCourse && matchesYear;
        });
    }, [activeOffering, allSections, selectedDepartmentId, selectedCourseId, selectedYearLevel]);

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
            form.setValue('department_id', '');
            form.setValue('course_id', '');
            form.setValue('year_level', 0);
            form.setValue('section_ids', []);
        },
        [form],
    );

    return {
        availableOfferings,
        validDepartments,
        validCourses,
        validYearLevels,
        validSections,
        selectedSubjectOfferingId,
        selectedDepartmentId,
        selectedCourseId,
        selectedYearLevel,
        selectedSectionIds,
        toggleSection,
        toggleAllSections,
        handleSubjectChange,
    };
}
