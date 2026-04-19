import type { ClassroomSummary } from '@sentinel/shared/types';

export type ExamClassroomOption = {
    id: string;
    title: string;
    subjectLabel: string;
    sectionLabel: string;
    termLabel: string;
};

export function mapClassroomsToExamOptions(classrooms: ClassroomSummary[]): ExamClassroomOption[] {
    return classrooms
        .map((classroom) => ({
            id: classroom.id,
            title: classroom.className || classroom.scopeSummary.sectionLabel,
            subjectLabel: classroom.scopeSummary.subjectLabel,
            sectionLabel: classroom.scopeSummary.sectionLabel,
            termLabel: classroom.scopeSummary.termLabel,
        }))
        .sort((left, right) => left.title.localeCompare(right.title));
}
