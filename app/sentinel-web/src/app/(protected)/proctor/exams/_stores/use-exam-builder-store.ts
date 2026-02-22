import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ExamQuestion, QuestionType } from '@sentinel/shared/types';

export type ExamBuilderState = {
    examId: string | null;
    title: string;
    description: string;
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
        durationMinutes: number;
        passingScore: number;
    }) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setQuestions: (questions: ExamQuestion[]) => void;
    addQuestion: (type: QuestionType) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    updateQuestionContent: (id: string, contentUpdates: Partial<ExamQuestion['content']>) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (startIndex: number, endIndex: number) => void;
    setSubmitting: (isSubmitting: boolean) => void;
    reset: () => void;
};

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

export type ExamBuilderStore = ExamBuilderState & ExamBuilderActions;

// Generate internal IDs for unsaved questions
const generateId = () => `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const useExamBuilderStore = create(
    immer<ExamBuilderStore>((set) => ({
        ...DEFAULT_EXAM_BUILDER_STATE,

        setExamMetadata: (metadata) => {
            set((state) => {
                state.examId = metadata.examId;
                state.title = metadata.title;
                state.description = metadata.description;
                state.durationMinutes = metadata.durationMinutes;
                state.passingScore = metadata.passingScore;
            });
        },

        setTitle: (title) => {
            set((state) => {
                state.title = title;
                state.isDirty = true;
            });
        },

        setDescription: (description) => {
            set((state) => {
                state.description = description;
                state.isDirty = true;
            });
        },

        setQuestions: (questions) => {
            set((state) => {
                state.questions = questions.sort((a, b) => a.orderIndex - b.orderIndex);
                state.isDirty = false;
            });
        },

        addQuestion: (type) => {
            set((state) => {
                const newQuestion: ExamQuestion = {
                    id: generateId(),
                    examId: state.examId || '',
                    type,
                    points: 1,
                    orderIndex: state.questions.length,
                    content: { prompt: '' },
                };

                // Setup basic default shape per type
                if (type === 'MULTIPLE_CHOICE') {
                    newQuestion.content = {
                        prompt: '',
                        options: ['', '', '', ''],
                        correctAnswer: '',
                    };
                } else if (type === 'IDENTIFICATION' || type === 'ENUMERATION') {
                    newQuestion.content = { prompt: '', acceptedAnswers: [''] };
                } else if (type === 'ESSAY') {
                    newQuestion.content = { prompt: '', rubric: '', maxLength: 1000 };
                } else if (type === 'TRUE_FALSE') {
                    newQuestion.content = { prompt: '', correctAnswer: true };
                }

                state.questions.push(newQuestion);
                state.isDirty = true;
            });
        },

        updateQuestion: (id, updates) => {
            set((state) => {
                const questionIndex = state.questions.findIndex((q) => q.id === id);
                if (questionIndex !== -1) {
                    Object.assign(state.questions[questionIndex], updates);
                    state.isDirty = true;
                }
            });
        },

        updateQuestionContent: (id, contentUpdates) => {
            set((state) => {
                const questionIndex = state.questions.findIndex((q) => q.id === id);
                if (questionIndex !== -1) {
                    Object.assign(state.questions[questionIndex].content, contentUpdates);
                    state.isDirty = true;
                }
            });
        },

        deleteQuestion: (id) => {
            set((state) => {
                state.questions = state.questions.filter((q) => q.id !== id);
                // Re-index remaining
                state.questions.forEach((q, idx) => {
                    q.orderIndex = idx;
                });
                state.isDirty = true;
            });
        },

        reorderQuestions: (startIndex, endIndex) => {
            set((state) => {
                const result = Array.from(state.questions);
                const [removed] = result.splice(startIndex, 1);
                result.splice(endIndex, 0, removed);

                // Re-index
                result.forEach((q, idx) => {
                    q.orderIndex = idx;
                });

                state.questions = result;
                state.isDirty = true;
            });
        },

        setSubmitting: (isSubmitting) => {
            set((state) => {
                state.isSubmitting = isSubmitting;
            });
        },

        reset: () => {
            set(() => DEFAULT_EXAM_BUILDER_STATE);
        },
    })),
);
