import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ExamQuestion } from '@sentinel/shared/types';

export interface Collection {
    id: string;
    name: string;
    description?: string;
    questionIds: string[];
    lastUpdated: string;
    isPublic: boolean;
}

interface QuestionBankState {
    questions: (ExamQuestion & { tags?: string[] })[];
    collections: Collection[];
    addQuestion: (question: Omit<ExamQuestion, 'id' | 'examId' | 'orderIndex'> & { tags?: string[] }) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion & { tags?: string[] }>) => void;
    deleteQuestion: (id: string) => void;
    importQuestions: (questions: (ExamQuestion & { tags?: string[] })[]) => void;
    
    // Collection Management
    addCollection: (collection: Omit<Collection, 'id' | 'lastUpdated'>) => void;
    updateCollection: (id: string, updates: Partial<Collection>) => void;
    deleteCollection: (id: string) => void;
    addQuestionsToCollection: (collectionId: string, questionIds: string[]) => void;
    removeQuestionsFromCollection: (collectionId: string, questionIds: string[]) => void;
}

const MOCK_QUESTIONS: (ExamQuestion & { tags?: string[] })[] = [
    {
        id: 'q1',
        examId: 'bank',
        type: 'MULTIPLE_CHOICE',
        points: 5,
        orderIndex: 0,
        tags: ['Math', 'Algebra'],
        content: {
            prompt: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 'Paris',
        },
    },
    {
        id: 'q2',
        examId: 'bank',
        type: 'TRUE_FALSE',
        points: 2,
        orderIndex: 1,
        tags: ['Geography'],
        content: {
            prompt: 'The earth is flat.',
            correctBoolean: false,
        },
    },
    {
        id: 'q3',
        examId: 'bank',
        type: 'IDENTIFICATION',
        points: 10,
        orderIndex: 2,
        tags: ['History', 'Literature'],
        content: {
            prompt: 'Who wrote "To Kill a Mockingbird"?',
            correctAnswer: 'Harper Lee',
            acceptedAnswers: ['Harper Lee', 'Nelle Harper Lee'],
        },
    },
];

const MOCK_COLLECTIONS: Collection[] = [
    {
        id: 'col1',
        name: 'Mathematics Midterms',
        description: 'Core algebra and calculus questions for midterm preparation.',
        questionIds: ['q1'],
        lastUpdated: '2 days ago',
        isPublic: true,
    },
    {
        id: 'col2',
        name: 'General Education',
        description: 'Miscellaneous questions from various subjects.',
        questionIds: ['q2', 'q3'],
        lastUpdated: '3 days ago',
        isPublic: false,
    },
];

export const useQuestionBank = create<QuestionBankState>()(
    persist(
        (set) => ({
            questions: MOCK_QUESTIONS,
            collections: MOCK_COLLECTIONS,
            addQuestion: (question) =>
                set((state) => ({
                    questions: [
                        ...state.questions,
                        {
                            ...question,
                            id: crypto.randomUUID(),
                            examId: 'bank',
                            orderIndex: state.questions.length,
                        } as (ExamQuestion & { tags?: string[] }),
                    ],
                })),
            updateQuestion: (id, updates) =>
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === id ? { ...q, ...updates } : q
                    ),
                })),
            deleteQuestion: (id) =>
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== id),
                    // Also remove from any collections
                    collections: state.collections.map(col => ({
                        ...col,
                        questionIds: col.questionIds.filter(qid => qid !== id)
                    }))
                })),
            importQuestions: (newQuestions) =>
                set((state) => ({
                    questions: [...state.questions, ...newQuestions],
                })),

            // Collection Management Implementation
            addCollection: (collection) =>
                set((state) => ({
                    collections: [
                        {
                            ...collection,
                            id: crypto.randomUUID(),
                            lastUpdated: 'Just now',
                        },
                        ...state.collections,
                    ],
                })),
            updateCollection: (id, updates) =>
                set((state) => ({
                    collections: state.collections.map((c) =>
                        c.id === id ? { ...c, ...updates, lastUpdated: 'Just now' } : c
                    ),
                })),
            deleteCollection: (id) =>
                set((state) => ({
                    collections: state.collections.filter((c) => c.id !== id),
                })),
            addQuestionsToCollection: (collectionId, questionIds) =>
                set((state) => ({
                    collections: state.collections.map((c) =>
                        c.id === collectionId
                            ? { ...c, questionIds: Array.from(new Set([...c.questionIds, ...questionIds])), lastUpdated: 'Just now' }
                            : c
                    ),
                })),
            removeQuestionsFromCollection: (collectionId, questionIds) =>
                set((state) => ({
                    collections: state.collections.map((c) =>
                        c.id === collectionId
                            ? { ...c, questionIds: c.questionIds.filter(qid => !questionIds.includes(qid)), lastUpdated: 'Just now' }
                            : c
                    ),
                })),
        }),
        {
            name: 'sentinel-question-bank',
        }
    )
);
