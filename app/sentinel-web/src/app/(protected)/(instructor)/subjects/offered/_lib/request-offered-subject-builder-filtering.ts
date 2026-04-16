import type { SubjectOfferingCourse, SubjectOfferingSection } from '@sentinel/shared/types';

export function mergeRequestBuilderScopeIds(explicitIds: string[], derivedIds: string[]) {
    return Array.from(
        new Set([...explicitIds, ...derivedIds].filter((value): value is string => Boolean(value))),
    );
}

export function filterRequestBuilderCoursesByDepartments(
    courses: SubjectOfferingCourse[],
    sections: SubjectOfferingSection[],
    selectedDepartmentIds: string[],
) {
    if (selectedDepartmentIds.length === 0) {
        return courses;
    }

    const visibleCourseIds = new Set(
        sections
            .filter((section) =>
                section.departmentId ? selectedDepartmentIds.includes(section.departmentId) : false,
            )
            .map((section) => section.courseId)
            .filter((courseId): courseId is string => Boolean(courseId)),
    );

    return courses.filter((course) => visibleCourseIds.has(course.id));
}

export function filterRequestBuilderSections({
    sections,
    selectedDepartmentIds,
    selectedCourseIds,
    selectedYearLevels,
}: {
    sections: SubjectOfferingSection[];
    selectedDepartmentIds: string[];
    selectedCourseIds: string[];
    selectedYearLevels: number[];
}) {
    return sections.filter((section) => {
        const matchesDepartment =
            selectedDepartmentIds.length === 0 ||
            section.departmentId == null ||
            selectedDepartmentIds.includes(section.departmentId);
        const matchesCourse =
            selectedCourseIds.length === 0 ||
            section.courseId == null ||
            selectedCourseIds.includes(section.courseId);
        const matchesYearLevel =
            selectedYearLevels.length === 0 ||
            section.yearLevel == null ||
            selectedYearLevels.includes(section.yearLevel);

        return matchesDepartment && matchesCourse && matchesYearLevel;
    });
}

export function deriveRequestBuilderYearLevels({
    sections,
    offeredYearLevels,
    selectedDepartmentIds,
    selectedCourseIds,
}: {
    sections: SubjectOfferingSection[];
    offeredYearLevels: number[];
    selectedDepartmentIds: string[];
    selectedCourseIds: string[];
}) {
    const matchedSections = filterRequestBuilderSections({
        sections,
        selectedDepartmentIds,
        selectedCourseIds,
        selectedYearLevels: [],
    });

    const sectionYearLevels = Array.from(
        new Set(
            matchedSections
                .map((section) => section.yearLevel)
                .filter((yearLevel): yearLevel is number => typeof yearLevel === 'number'),
        ),
    ).sort((left, right) => left - right);

    if (offeredYearLevels.length === 0) {
        return sectionYearLevels;
    }

    if (sectionYearLevels.length === 0) {
        return selectedDepartmentIds.length > 0 || selectedCourseIds.length > 0
            ? []
            : [...offeredYearLevels].sort((left, right) => left - right);
    }

    return [...offeredYearLevels]
        .sort((left, right) => left - right)
        .filter((yearLevel) => sectionYearLevels.includes(yearLevel));
}
