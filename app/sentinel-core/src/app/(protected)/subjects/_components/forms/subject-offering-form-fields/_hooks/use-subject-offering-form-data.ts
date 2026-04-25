'use client';

import {
    useCoursesQuery,
    useDebounce,
    useDepartmentsQuery,
    useSectionsQuery,
    useSemestersQuery,
    useStableOptions,
    useStableValue,
    useSubjectsQuery,
} from '@sentinel/hooks';
import { useEffect, useState } from 'react';
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

function mergeOptionsWithSelected(
    options: FilterableCheckboxOption[],
    selectedValues: string[] | undefined,
    knownLabels: Record<string, string>,
) {
    const mergedOptions = new Map(options.map((option) => [option.value, option]));

    (selectedValues ?? []).forEach((value) => {
        if (!mergedOptions.has(value) && knownLabels[value]) {
            mergedOptions.set(value, {
                value,
                label: knownLabels[value],
            });
        }
    });

    return Array.from(mergedOptions.values());
}

export function useSubjectOfferingFormData({
    form,
    subjectToOffer,
    open,
}: Pick<SubjectOfferingFormFieldsProps, 'form' | 'subjectToOffer' | 'open'>) {
    const { assignedDepartmentId, assignedCourseId, shouldLockDepartment, shouldLockCourse } =
        useAcademicScope();
    const [departmentSearch, setDepartmentSearch] = useState('');
    const [courseSearch, setCourseSearch] = useState('');
    const [sectionSearch, setSectionSearch] = useState('');
    const [selectedDepartmentLabels, setSelectedDepartmentLabels] = useState<
        Record<string, string>
    >({});
    const [selectedCourseLabels, setSelectedCourseLabels] = useState<Record<string, string>>({});
    const [selectedSectionLabels, setSelectedSectionLabels] = useState<Record<string, string>>({});
    const debouncedDepartmentSearch = useDebounce(departmentSearch, 400);
    const debouncedCourseSearch = useDebounce(courseSearch, 400);
    const debouncedSectionSearch = useDebounce(sectionSearch, 400);

    const { data: subjects = [] } = useSubjectsQuery(undefined, open);
    const { data: semesters = [] } = useSemestersQuery(undefined, undefined, open);
    const { data: departments = [] } = useDepartmentsQuery(
        debouncedDepartmentSearch || undefined,
        undefined,
        open,
    );

    const selectedSubjectId = useWatch({ control: form.control, name: 'subject_id' });
    const selectedTermId = useWatch({ control: form.control, name: 'term_id' });
    const selectedDepartmentIds = useWatch({ control: form.control, name: 'department_ids' });
    const selectedCourseIds = useWatch({ control: form.control, name: 'course_ids' });
    const selectedYearLevels = useWatch({ control: form.control, name: 'year_levels' });
    const selectedSectionIds = useWatch({ control: form.control, name: 'section_ids' });

    const shouldQueryCourses = open && (selectedDepartmentIds?.length ?? 0) > 0;
    const { data: courses = [] } = useCoursesQuery(
        debouncedCourseSearch || undefined,
        undefined,
        shouldQueryCourses,
    );
    const { data: sections = [] } = useSectionsQuery(
        debouncedSectionSearch || undefined,
        undefined,
        open,
    );

    const selectedSubject = useStableValue(
        () =>
            subjectToOffer ?? subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
        [selectedSubjectId, subjectToOffer, subjects],
    );
    const selectedTerm = useStableValue(
        () => semesters.find((semester) => semester.id === selectedTermId) ?? null,
        [selectedTermId, semesters],
    );

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

    const filteredSections = useStableValue(
        () =>
            sections.filter((section) => {
                const matchesDepartment =
                    !selectedDepartmentIds?.length ||
                    (section.departmentId
                        ? selectedDepartmentIds.includes(section.departmentId)
                        : false);
                const matchesCourse =
                    !selectedCourseIds?.length ||
                    (section.courseId ? selectedCourseIds.includes(section.courseId) : false);
                const matchesYear =
                    !selectedYearLevels?.length ||
                    (section.yearLevel ? selectedYearLevels.includes(section.yearLevel) : false);

                return matchesDepartment && matchesCourse && matchesYear;
            }),
        [sections, selectedCourseIds, selectedDepartmentIds, selectedYearLevels],
    );

    const sectionOptions = useStableOptions(filteredSections, (section) => section.name);

    const mergedDepartmentOptions = useStableValue(
        () =>
            mergeOptionsWithSelected(
                departmentOptions,
                selectedDepartmentIds,
                selectedDepartmentLabels,
            ),
        [departmentOptions, selectedDepartmentIds, selectedDepartmentLabels],
    );

    const mergedCourseOptions = useStableValue(
        () => mergeOptionsWithSelected(courseOptions, selectedCourseIds, selectedCourseLabels),
        [courseOptions, selectedCourseIds, selectedCourseLabels],
    );

    const mergedSectionOptions = useStableValue(
        () => mergeOptionsWithSelected(sectionOptions, selectedSectionIds, selectedSectionLabels),
        [sectionOptions, selectedSectionIds, selectedSectionLabels],
    );

    const departmentLabelMap = useStableValue(
        () => new Map(mergedDepartmentOptions.map((option) => [option.value, option.label])),
        [mergedDepartmentOptions],
    );
    const courseLabelMap = useStableValue(
        () => new Map(mergedCourseOptions.map((option) => [option.value, option.label])),
        [mergedCourseOptions],
    );
    const sectionLabelMap = useStableValue(
        () => new Map(mergedSectionOptions.map((option) => [option.value, option.label])),
        [mergedSectionOptions],
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

    useEffect(() => {
        const allowedSectionIds = new Set(filteredSections.map((section) => section.id));
        const currentSectionIds = form.getValues('section_ids') ?? [];
        const nextSectionIds = currentSectionIds.filter((sectionId) =>
            allowedSectionIds.has(sectionId),
        );

        if (nextSectionIds.length !== currentSectionIds.length) {
            form.setValue('section_ids', nextSectionIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [filteredSections, form]);

    function setDepartmentIds(values: string[]) {
        rememberDepartmentLabels(values);
        form.setValue('department_ids', values, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    function setCourseIds(values: string[]) {
        rememberCourseLabels(values);
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

    function setSectionIds(values: string[]) {
        rememberSectionLabels(values);
        form.setValue('section_ids', values, {
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

    function toggleSection(sectionId: string) {
        toggleStringListValue(selectedSectionIds, sectionId, setSectionIds);
    }

    function toggleYearLevel(yearLevel: number) {
        const safeValues = selectedYearLevels ?? [];
        const nextValues = safeValues.includes(yearLevel)
            ? safeValues.filter((value) => value !== yearLevel)
            : [...safeValues, yearLevel].sort((left, right) => left - right);

        setYearLevels(nextValues);
    }

    function rememberDepartmentLabels(values: string[]) {
        if (values.length === 0) {
            return;
        }

        setSelectedDepartmentLabels((current) => {
            const next = { ...current };
            const availableLabelMap = new Map(
                departmentOptions.map((option) => [option.value, option.label]),
            );

            values.forEach((value) => {
                const label = availableLabelMap.get(value);

                if (label) {
                    next[value] = label;
                }
            });

            return next;
        });
    }

    function rememberCourseLabels(values: string[]) {
        if (values.length === 0) {
            return;
        }

        setSelectedCourseLabels((current) => {
            const next = { ...current };
            const availableLabelMap = new Map(
                courseOptions.map((option) => [option.value, option.label]),
            );

            values.forEach((value) => {
                const label = availableLabelMap.get(value);

                if (label) {
                    next[value] = label;
                }
            });

            return next;
        });
    }

    function rememberSectionLabels(values: string[]) {
        if (values.length === 0) {
            return;
        }

        setSelectedSectionLabels((current) => {
            const next = { ...current };
            const availableLabelMap = new Map(
                sectionOptions.map((option) => [option.value, option.label]),
            );

            values.forEach((value) => {
                const label = availableLabelMap.get(value);

                if (label) {
                    next[value] = label;
                }
            });

            return next;
        });
    }

    return {
        subjects,
        semesters,
        filteredCourses,
        departmentOptions: mergedDepartmentOptions,
        courseOptions: mergedCourseOptions,
        sectionOptions: mergedSectionOptions,
        yearLevelOptions,
        selectedDepartmentIds: selectedDepartmentIds ?? [],
        selectedCourseIds: selectedCourseIds ?? [],
        selectedYearLevels: selectedYearLevels ?? [],
        selectedSectionIds: selectedSectionIds ?? [],
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
        departmentSearch,
        courseSearch,
        sectionSearch,
        setDepartmentIds,
        setCourseIds,
        setSectionIds,
        setYearLevels,
        setDepartmentSearch: (value: string) => {
            rememberDepartmentLabels(selectedDepartmentIds ?? []);
            setDepartmentSearch(value);
        },
        setCourseSearch: (value: string) => {
            rememberCourseLabels(selectedCourseIds ?? []);
            setCourseSearch(value);
        },
        setSectionSearch: (value: string) => {
            rememberSectionLabels(selectedSectionIds ?? []);
            setSectionSearch(value);
        },
        toggleDepartment,
        toggleCourse,
        toggleSection,
        toggleYearLevel,
    };
}
