export const normalizeStudentNumber = (value: string) => value.trim();

const normalizeCourseToken = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');

export function doesImportedCourseMatchSelectedCourse({
    importedCourse,
    selectedCourseCode,
    selectedCourseTitle,
}: {
    importedCourse?: string | null;
    selectedCourseCode?: string | null;
    selectedCourseTitle?: string | null;
}) {
    if (!importedCourse?.trim()) {
        return true;
    }

    const normalizedImportedCourse = normalizeCourseToken(importedCourse);
    if (!normalizedImportedCourse) {
        return true;
    }

    const normalizedExpectedValues = [selectedCourseCode, selectedCourseTitle]
        .filter((value): value is string => Boolean(value?.trim()))
        .map(normalizeCourseToken);

    return normalizedExpectedValues.includes(normalizedImportedCourse);
}
