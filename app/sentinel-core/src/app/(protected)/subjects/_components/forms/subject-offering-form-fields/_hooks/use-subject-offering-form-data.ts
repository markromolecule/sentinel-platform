'use client';

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useSectionsQuery,
    useSemestersQuery,
    useStableIdMap,
    useStableOptions,
    useStableValue,
    useSubjectsQuery,
} from '@sentinel/hooks';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { type FilterableCheckboxOption } from '@/app/(protected)/subjects/_components/forms/filterable-checkbox-group';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { type SubjectOfferingFormFieldsProps } from '../_types';
import {
    formatDateRange,
    formatTermLabel,
    summarizeSelection,
    YEAR_LEVEL_OPTIONS,
} from '../_helpers';

function getCourseDepartmentId(course: { departmentId?: string | null; department?: string }) {
    return course.departmentId ?? course.department ?? null;
}

function mapSelectedLabels(selectedIds: string[] | undefined, labelMap: Map<string, string>) {
    if (!selectedIds?.length) {
        return [];
    }

    return selectedIds
        .map((selectedId) => labelMap.get(selectedId))
        .filter((value): value is string => Boolean(value));
}

function toggleStringListValue(
    currentValues: string[] | undefined,
    nextValue: string,
    onChange: (values: string[]) => void,
) {
    const safeValues = currentValues ?? [];
    const nextValues = safeValues.includes(nextValue)
        ? safeValues.filter((value) => value !== nextValue)
        : [...safeValues, nextValue];

    onChange(nextValues);
}

export function useSubjectOfferingFormData({
    form,
    subjectToOffer,
}: Pick<SubjectOfferingFormFieldsProps, 'form' | 'subjectToOffer'>) {
    const { assignedDepartmentId, assignedCourseId, shouldLockDepartment, shouldLockCourse } =
        useAcademicScope();
    const { data: subjects = [] } = useSubjectsQuery();
    const { data: semesters = [] } = useSemestersQuery();
    const { data: departments = [] } = useDepartmentsQuery();
    const { data: courses = [] } = useCoursesQuery();
    const { data: sections = [] } = useSectionsQuery();

    const selectedSubjectId = useWatch({ control: form.control, name: 'subject_id' });
    const selectedTermId = useWatch({ control: form.control, name: 'term_id' });
    const selectedDepartmentIds = useWatch({ control: form.control, name: 'department_ids' });
    const selectedCourseIds = useWatch({ control: form.control, name: 'course_ids' });
    const selectedYearLevels = useWatch({ control: form.control, name: 'year_levels' });
    const selectedSectionIds = useWatch({ control: form.control, name: 'section_ids' });

    const selectedSubject = useStableValue(
        () =>
            subjectToOffer ?? subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
        [selectedSubjectId, subjectToOffer, subjects],
    );
    const selectedTerm = useStableValue(
        () => semesters.find((semester) => semester.id === selectedTermId) ?? null,
        [selectedTermId, semesters],
    );

    const departmentLabelMap = useStableIdMap(
        departments,
        (department) => department.code?.trim() || department.name,
    );

    const courseLabelMap = useStableIdMap(courses, (course) => course.code?.trim() || course.title);

    const sectionLabelMap = useStableIdMap(sections, (section) => section.name);

    const departmentOptions = useStableOptions(
        departments,
        (department) => department.code?.trim() || department.name,
    );

    const filteredCourses = useStableValue(
        () =>
            !selectedDepartmentIds?.length
                ? courses
                : courses.filter((course) => {
                      const courseDepartmentId = getCourseDepartmentId(course);
                      return courseDepartmentId
                          ? selectedDepartmentIds.includes(courseDepartmentId)
                          : false;
                  }),
        [courses, selectedDepartmentIds],
    );

    const courseOptions = useStableOptions(
        filteredCourses,
        (course) => course.code?.trim() || course.title,
    );

    const yearLevelOptions = useStableValue<FilterableCheckboxOption[]>(
        () =>
            YEAR_LEVEL_OPTIONS.map((yearLevel) => ({
                value: String(yearLevel),
                label: `Year ${yearLevel}`,
            })),
        [],
    );

    const selectedDepartments = useStableValue(
        () => mapSelectedLabels(selectedDepartmentIds, departmentLabelMap),
        [departmentLabelMap, selectedDepartmentIds],
    );

    const selectedCourses = useStableValue(
        () => mapSelectedLabels(selectedCourseIds, courseLabelMap),
        [courseLabelMap, selectedCourseIds],
    );

    const selectedSections = useStableValue(
        () => mapSelectedLabels(selectedSectionIds, sectionLabelMap),
        [sectionLabelMap, selectedSectionIds],
    );

    const selectedYearLevelLabels = useStableValue(
        () => (selectedYearLevels ?? []).map((yearLevel) => `Year ${yearLevel}`),
        [selectedYearLevels],
    );

    const selectedSubjectLabel = useStableValue(
        () =>
            selectedSubject
                ? `${selectedSubject.code} - ${selectedSubject.title}`
                : 'Choose a subject',
        [selectedSubject],
    );
    const selectedTermLabel = useStableValue(
        () =>
            selectedTerm
                ? formatTermLabel(selectedTerm.academicYear, selectedTerm.semester)
                : 'Choose a term',
        [selectedTerm],
    );
    const selectedTermDates = useStableValue(
        () => (selectedTerm ? formatDateRange(selectedTerm.startDate, selectedTerm.endDate) : null),
        [selectedTerm],
    );

    const departmentSummary = useStableValue(
        () => summarizeSelection(selectedDepartments, 'No departments selected yet.'),
        [selectedDepartments],
    );
    const courseSummary = useStableValue(
        () => summarizeSelection(selectedCourses, 'No courses selected yet.'),
        [selectedCourses],
    );
    const yearLevelSummary = useStableValue(
        () => summarizeSelection(selectedYearLevelLabels, 'No year levels selected yet.'),
        [selectedYearLevelLabels],
    );
    const sectionSummary = useStableValue(
        () => summarizeSelection(selectedSections, 'No sections selected yet.'),
        [selectedSections],
    );

    useEffect(() => {
        if (shouldLockDepartment && assignedDepartmentId) {
            const nextDepartmentIds = [assignedDepartmentId];
            const currentDepartmentIds = form.getValues('department_ids') ?? [];

            if (
                currentDepartmentIds.length !== nextDepartmentIds.length ||
                currentDepartmentIds[0] !== assignedDepartmentId
            ) {
                form.setValue('department_ids', nextDepartmentIds, {
                    shouldDirty: false,
                    shouldValidate: true,
                });
            }
        }
    }, [assignedDepartmentId, form, shouldLockDepartment]);

    useEffect(() => {
        if (shouldLockCourse && assignedCourseId) {
            const nextCourseIds = [assignedCourseId];
            const currentCourseIds = form.getValues('course_ids') ?? [];

            if (
                currentCourseIds.length !== nextCourseIds.length ||
                currentCourseIds[0] !== assignedCourseId
            ) {
                form.setValue('course_ids', nextCourseIds, {
                    shouldDirty: false,
                    shouldValidate: true,
                });
            }
        }
    }, [assignedCourseId, form, shouldLockCourse]);

    useEffect(() => {
        const allowedCourseIds = new Set(filteredCourses.map((course) => course.id));
        const currentCourseIds = form.getValues('course_ids') ?? [];
        const nextCourseIds = currentCourseIds.filter((courseId) => allowedCourseIds.has(courseId));

        if (nextCourseIds.length !== currentCourseIds.length) {
            form.setValue('course_ids', nextCourseIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [filteredCourses, form]);

    function setDepartmentIds(values: string[]) {
        form.setValue('department_ids', values, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function setCourseIds(values: string[]) {
        form.setValue('course_ids', values, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function setYearLevels(values: number[]) {
        form.setValue('year_levels', values, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function toggleDepartment(departmentId: string) {
        toggleStringListValue(selectedDepartmentIds, departmentId, setDepartmentIds);
    }

    function toggleCourse(courseId: string) {
        toggleStringListValue(selectedCourseIds, courseId, setCourseIds);
    }

    function toggleYearLevel(yearLevel: number) {
        const safeValues = selectedYearLevels ?? [];
        const nextValues = safeValues.includes(yearLevel)
            ? safeValues.filter((value) => value !== yearLevel)
            : [...safeValues, yearLevel].sort((left, right) => left - right);

        setYearLevels(nextValues);
    }

    return {
        subjects,
        semesters,
        filteredCourses,
        departmentOptions,
        courseOptions,
        yearLevelOptions,
        selectedDepartmentIds: selectedDepartmentIds ?? [],
        selectedCourseIds: selectedCourseIds ?? [],
        selectedYearLevels: selectedYearLevels ?? [],
        selectedDepartments,
        selectedCourses,
        selectedSections,
        selectedYearLevelLabels,
        selectedSubjectLabel,
        selectedTermLabel,
        selectedTermDates,
        departmentSummary,
        courseSummary,
        yearLevelSummary,
        sectionSummary,
        isDepartmentLocked: shouldLockDepartment && Boolean(assignedDepartmentId),
        isCourseLocked: shouldLockCourse && Boolean(assignedCourseId),
        setDepartmentIds,
        setCourseIds,
        setYearLevels,
        toggleDepartment,
        toggleCourse,
        toggleYearLevel,
    };
}
