import { ExamQuestion, ExamQuestionContent, QuestionType } from '@sentinel/shared/types';

export type ExamBuilderState = {
    examId: string | null;
    title: string;
    description: string;
    subjectId: string | null;
    section: string | null;
    durationMinutes: number;
    passingScore: number;
    questions: ExamQuestion[];
    isDirty: boolean;
    isSubmitting: boolean;
};

export type ExamBuilderActions = {
    setExamMetadata: (metadata: {
        examId: string;
        title: string;
        description: string;
        subjectId: string;
        section: string;
        durationMinutes: number;
        passingScore: number;
    }) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setQuestions: (questions: ExamQuestion[]) => void;
    addQuestion: (
        type: QuestionType,
        payload?: {
            content?: ExamQuestionContent;
            points?: number;
        },
    ) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    updateQuestionContent: (id: string, contentUpdates: Partial<ExamQuestion['content']>) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (startIndex: number, endIndex: number) => void;
    setSubmitting: (isSubmitting: boolean) => void;
    reset: () => void;
};
