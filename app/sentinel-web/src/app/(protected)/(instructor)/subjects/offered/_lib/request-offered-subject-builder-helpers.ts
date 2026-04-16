export interface RequestOfferedSubjectBuilderCheckboxOption {
    value: string;
    label: string;
}

export interface RequestOfferedSubjectTargetCountBadge {
    key: 'departments' | 'courses' | 'year-levels' | 'sections';
    label: string;
    count: number;
    value: string;
}

interface BuildGroupedRequestPreviewTextInput {
    departments?: string[];
    courses?: string[];
    yearLevels?: string[];
    sections?: string[];
}

interface ResolveSuggestedDepartmentIdsInput {
    selectedDepartmentIds: string[];
    availableDepartmentIds: string[];
}

interface ResolveSuggestedCourseIdsInput {
    selectedCourseIds: string[];
    visibleCourseIds: string[];
}

interface CanSubmitGroupedRequestInput {
    departmentIds: string[];
    courseIds: string[];
    yearLevels: number[];
    sectionIds: string[];
}

export const REQUEST_OFFERED_SUBJECT_BUILDER_YEAR_LEVEL_OPTIONS: RequestOfferedSubjectBuilderCheckboxOption[] =
    [1, 2, 3, 4, 5, 6].map((yearLevel) => ({
        value: String(yearLevel),
        label: `Year ${yearLevel}`,
    }));

export function createStableCheckboxOptions<T>(
    items: T[],
    getValue: (item: T) => string,
    getLabel: (item: T) => string,
): RequestOfferedSubjectBuilderCheckboxOption[] {
    const optionMap = new Map<string, RequestOfferedSubjectBuilderCheckboxOption>();

    items.forEach((item) => {
        const value = getValue(item);

        if (!value || optionMap.has(value)) {
            return;
        }

        optionMap.set(value, {
            value,
            label: getLabel(item).trim(),
        });
    });

    return Array.from(optionMap.values()).sort((left, right) =>
        left.label.localeCompare(right.label, undefined, {
            numeric: true,
            sensitivity: 'base',
        }),
    );
}

export function summarizeSelectedLabels(labels: string[], emptyLabel: string, limit = 3) {
    if (labels.length === 0) {
        return emptyLabel;
    }

    const visibleLabels = labels.slice(0, limit);
    const remainingCount = labels.length - visibleLabels.length;

    return remainingCount > 0
        ? `${visibleLabels.join(', ')} +${remainingCount} more`
        : visibleLabels.join(', ');
}

function formatCountLabel(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function buildRequestTargetCountBadges({
    departmentCount,
    courseCount,
    yearLevelCount,
    sectionCount,
}: {
    departmentCount: number;
    courseCount: number;
    yearLevelCount: number;
    sectionCount: number;
}): RequestOfferedSubjectTargetCountBadge[] {
    return [
        {
            key: 'departments',
            label: 'Departments',
            count: departmentCount,
            value: formatCountLabel(departmentCount, 'department', 'departments'),
        },
        {
            key: 'courses',
            label: 'Courses',
            count: courseCount,
            value: formatCountLabel(courseCount, 'course', 'courses'),
        },
        {
            key: 'year-levels',
            label: 'Year Levels',
            count: yearLevelCount,
            value: formatCountLabel(yearLevelCount, 'year level', 'year levels'),
        },
        {
            key: 'sections',
            label: 'Sections',
            count: sectionCount,
            value: formatCountLabel(sectionCount, 'section', 'sections'),
        },
    ];
}

export function buildGroupedRequestPreviewText({
    departments = [],
    courses = [],
    yearLevels = [],
    sections = [],
}: BuildGroupedRequestPreviewTextInput) {
    const previewParts: string[] = [];

    if (departments.length > 0) {
        previewParts.push(
            `${formatCountLabel(departments.length, 'department', 'departments')} (${summarizeSelectedLabels(departments, '', 2)})`,
        );
    }

    if (courses.length > 0) {
        previewParts.push(
            `${formatCountLabel(courses.length, 'course', 'courses')} (${summarizeSelectedLabels(courses, '', 2)})`,
        );
    }

    if (yearLevels.length > 0) {
        previewParts.push(
            `${formatCountLabel(yearLevels.length, 'year level', 'year levels')} (${summarizeSelectedLabels(yearLevels, '', 3)})`,
        );
    }

    if (sections.length > 0) {
        previewParts.push(
            `${formatCountLabel(sections.length, 'section', 'sections')} (${summarizeSelectedLabels(sections, '', 2)})`,
        );
    }

    if (previewParts.length === 0) {
        return 'No request targets selected yet.';
    }

    return `This request currently targets ${previewParts.join(', ')}.`;
}

export function resolveSuggestedDepartmentIds({
    selectedDepartmentIds,
    availableDepartmentIds,
}: ResolveSuggestedDepartmentIdsInput) {
    if (selectedDepartmentIds.length > 0) {
        return null;
    }

    if (availableDepartmentIds.length === 1) {
        return [availableDepartmentIds[0]];
    }

    return null;
}

export function resolveSuggestedCourseIds({
    selectedCourseIds,
    visibleCourseIds,
}: ResolveSuggestedCourseIdsInput) {
    if (selectedCourseIds.length > 0) {
        return null;
    }

    if (visibleCourseIds.length === 1) {
        return [visibleCourseIds[0]];
    }

    return null;
}

export function canSubmitGroupedRequest({
    departmentIds,
    courseIds,
    yearLevels,
    sectionIds,
}: CanSubmitGroupedRequestInput) {
    return (
        sectionIds.length > 0 ||
        (departmentIds.length > 0 && courseIds.length > 0 && yearLevels.length > 0)
    );
}
