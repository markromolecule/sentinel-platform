import type { StudentExamStage } from './_types';

/**
 * Builds the canonical route for a given exam stage.
 */
export function buildStudentExamHref(examId: string, stage: StudentExamStage): string {
    return `/student/exam/${examId}/${stage}`;
}
