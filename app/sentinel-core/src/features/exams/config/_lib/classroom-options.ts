import type { ClassroomSummary } from '@sentinel/shared/types';

export type ExamClassroomOption = {
    id: string;
    title: string;
    subjectId: string | null;
    subjectLabel: string;
    sectionId: string | null;
    sectionLabel: string;
    termLabel: string;
    departmentId: string | null;
    departmentLabel: string | null;
    courseId: string | null;
    courseLabel: string | null;
};

export function mapClassroomsToExamOptions(classrooms: ClassroomSummary[]): ExamClassroomOption[] {
    const uniqueClassrooms = Array.from(new Map(classrooms.map((c) => [c.id, c])).values());

    return uniqueClassrooms
        .map((classroom) => ({
            id: classroom.id,
            title: classroom.className || classroom.scopeSummary.sectionLabel,
            subjectId: classroom.subjectId,
            subjectLabel: classroom.scopeSummary.subjectLabel,
            sectionId: classroom.sectionId,
            sectionLabel: classroom.scopeSummary.sectionLabel,
            termLabel: classroom.scopeSummary.termLabel,
            departmentId: classroom.departmentId,
            departmentLabel: classroom.scopeSummary.departmentLabel,
            courseId: classroom.courseId,
            courseLabel: classroom.scopeSummary.courseLabel,
        }))
        .sort((left, right) => left.title.localeCompare(right.title));
}
