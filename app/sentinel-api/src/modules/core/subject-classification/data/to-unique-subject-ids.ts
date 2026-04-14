export function toUniqueSubjectIds(subjectIds: string[] | undefined) {
    return Array.from(new Set((subjectIds ?? []).filter(Boolean)));
}
