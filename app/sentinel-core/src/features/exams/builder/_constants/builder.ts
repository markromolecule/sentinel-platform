import { DEFAULT_EXAMINATION_GLOBAL_SETTINGS } from '@sentinel/shared/constants';
import { ExamBuilderState } from '@/features/exams/builder/_types/builder';

export const DEFAULT_EXAM_BUILDER_STATE: ExamBuilderState = {
    examId: null,
    title: '',
    description: '',
    classroomId: null,
    classroomName: null,
    subjectId: null,
    section: null,
    durationMinutes: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultDurationMinutes,
    passingScore: DEFAULT_EXAMINATION_GLOBAL_SETTINGS.defaultPassingScore,
    questions: [],
    isDirty: false,
    isSubmitting: false,
};
