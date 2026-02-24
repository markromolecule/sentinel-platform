import { ExamBuilderState } from '@/app/(protected)/proctor/exams/_types/builder';

export const DEFAULT_EXAM_BUILDER_STATE: ExamBuilderState = {
    examId: null,
    title: '',
    description: '',
    durationMinutes: 60,
    passingScore: 60,
    questions: [],
    isDirty: false,
    isSubmitting: false,
};
