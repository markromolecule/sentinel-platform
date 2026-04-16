function compactUnique(values: Array<string | null | undefined>) {
    return Array.from(
        new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
    );
}

function formatCount(count: number, singular: string, plural: string) {
    return `${count} ${count === 1 ? singular : plural}`;
}

function summarizeLabels(labels: string[], singular: string, plural: string) {
    if (labels.length === 0) {
        return null;
    }

    if (labels.length === 1) {
        return labels[0];
    }

    return formatCount(labels.length, singular, plural);
}

export function buildDepartmentSummary(labels: Array<string | null | undefined>) {
    return summarizeLabels(compactUnique(labels), 'department', 'departments');
}

export function buildCourseSummary(labels: Array<string | null | undefined>) {
    return summarizeLabels(compactUnique(labels), 'course', 'courses');
}

export function buildYearLevelSummary(yearLevels: number[] | undefined) {
    const normalizedYearLevels = Array.from(
        new Set((yearLevels ?? []).filter((yearLevel) => Number.isInteger(yearLevel))),
    ).sort((left, right) => left - right);

    if (normalizedYearLevels.length === 0) {
        return null;
    }

    if (normalizedYearLevels.length === 1) {
        return `Year ${normalizedYearLevels[0]}`;
    }

    return formatCount(normalizedYearLevels.length, 'year level', 'year levels');
}

export function buildSectionSummary(sectionCount: number) {
    if (sectionCount <= 0) {
        return null;
    }

    return formatCount(sectionCount, 'section', 'sections');
}

export function buildScopeSummary({
    departments,
    courses,
    yearLevels,
    sectionCount,
}: {
    departments: Array<string | null | undefined>;
    courses: Array<string | null | undefined>;
    yearLevels?: number[];
    sectionCount: number;
}) {
    const summaryParts = [
        buildDepartmentSummary(departments),
        buildCourseSummary(courses),
        buildYearLevelSummary(yearLevels),
        buildSectionSummary(sectionCount),
    ].filter((value): value is string => Boolean(value));

    if (summaryParts.length === 0) {
        return null;
    }

    return summaryParts.join(', ');
}
