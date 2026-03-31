'use client';

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useSectionsQuery,
    useSemestersQuery,
    useSubjectsQuery,
} from '@sentinel/hooks';
import { useEffect, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { type FilterableCheckboxOption } from '@/app/(protected)/(admin)/subjects/_components/forms/filterable-checkbox-group';
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

function buildLabelMap<T extends { id: string }>(items: T[], getLabel: (item: T) => string) {
    return new Map(items.map((item) => [item.id, getLabel(item)]));
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

    const selectedSubject =
        subjectToOffer ?? subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
    const selectedTerm = semesters.find((semester) => semester.id === selectedTermId) ?? null;

    const departmentLabelMap = useMemo(
        () =>
            buildLabelMap(departments, (department) => department.code?.trim() || department.name),
        [departments],
    );

    const courseLabelMap = useMemo(
        () => buildLabelMap(courses, (course) => course.code?.trim() || course.title),
        [courses],
    );

    const sectionLabelMap = useMemo(
        () => buildLabelMap(sections, (section) => section.name),
        [sections],
    );

    const departmentOptions = useMemo<FilterableCheckboxOption[]>(
        () =>
            departments.map((department) => ({
                value: department.id,
                label: department.code?.trim() || department.name,
            })),
        [departments],
    );

    const filteredCourses = useMemo(
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

    const courseOptions = useMemo<FilterableCheckboxOption[]>(
        () =>
            filteredCourses.map((course) => ({
                value: course.id,
                label: course.code?.trim() || course.title,
            })),
        [filteredCourses],
    );

    const yearLevelOptions = useMemo<FilterableCheckboxOption[]>(
        () =>
            YEAR_LEVEL_OPTIONS.map((yearLevel) => ({
                value: String(yearLevel),
                label: `Year ${yearLevel}`,
            })),
        [],
    );

    const selectedDepartments = useMemo(
        () => mapSelectedLabels(selectedDepartmentIds, departmentLabelMap),
        [departmentLabelMap, selectedDepartmentIds],
    );

    const selectedCourses = useMemo(
        () => mapSelectedLabels(selectedCourseIds, courseLabelMap),
        [courseLabelMap, selectedCourseIds],
    );

    const selectedSections = useMemo(
        () => mapSelectedLabels(selectedSectionIds, sectionLabelMap),
        [sectionLabelMap, selectedSectionIds],
    );

    const selectedYearLevelLabels = useMemo(
        () => (selectedYearLevels ?? []).map((yearLevel) => `Year ${yearLevel}`),
        [selectedYearLevels],
    );

    const selectedSubjectLabel = selectedSubject
        ? `${selectedSubject.code} - ${selectedSubject.title}`
        : 'Choose a subject';
    const selectedTermLabel = selectedTerm
        ? formatTermLabel(selectedTerm.academicYear, selectedTerm.semester)
        : 'Choose a term';
    const selectedTermDates = selectedTerm
        ? formatDateRange(selectedTerm.startDate, selectedTerm.endDate)
        : null;

    const departmentSummary = summarizeSelection(
        selectedDepartments,
        'No departments selected yet.',
    );
    const courseSummary = summarizeSelection(selectedCourses, 'No courses selected yet.');
    const yearLevelSummary = summarizeSelection(
        selectedYearLevelLabels,
        'No year levels selected yet.',
    );
    const sectionSummary = summarizeSelection(selectedSections, 'No sections selected yet.');

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
        setDepartmentIds,
        setCourseIds,
        setYearLevels,
        toggleDepartment,
        toggleCourse,
        toggleYearLevel,
    };
}
