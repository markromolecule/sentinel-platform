import { ExamBuilderState } from '@/features/exams/builder/_types/builder';

export const DEFAULT_EXAM_BUILDER_STATE: ExamBuilderState = {
    examId: null,
    title: '',
    description: '',
    classroomId: null,
    classroomName: null,
    subjectId: null,
    section: null,
    durationMinutes: 60,
    passingScore: 60,
    questions: [],
    isDirty: false,
    isSubmitting: false,
};
