import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ExamQuestion, Exam } from '@sentinel/shared/types';
import { MOCK_EXAMS } from '@sentinel/shared/mock-data';
import { toast } from 'sonner';

export type ExamStatus = 'draft' | 'published';

export interface ExamStoreState {
    examId: string | null;
    title: string;
    description: string;
    questions: ExamQuestion[];
    status: ExamStatus;
}

export interface ExamStoreActions {
    loadExam: (id: string) => void;
    setExamId: (id: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setQuestions: (questions: ExamQuestion[]) => void;
    addQuestion: (question: ExamQuestion) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    deleteQuestion: (id: string) => void;
    saveExam: () => void;
    publishExam: () => void;
}

export type ExamStore = ExamStoreState & ExamStoreActions;

export const useExamStore = create(
    immer<ExamStore>((set) => ({
        examId: null,
        title: 'Untitled Exam',
        description: '',
        questions: [],
        status: 'draft',

        loadExam: (id) => {
            let exam: Exam | undefined;
            if (typeof window !== 'undefined') {
                try {
                    const localExamsRaw = localStorage.getItem('sentinel_mock_exams');
                    const localExams: Exam[] = localExamsRaw ? JSON.parse(localExamsRaw) : [];
                    exam = localExams.find(e => e.id === id);
                } catch {}
            }
            if (!exam) {
                exam = MOCK_EXAMS.find(e => e.id === id);
            }
            if (exam) {
                set((state) => {
                    state.examId = exam.id;
                    state.title = exam.title;
                    state.description = exam.description || '';
                    state.questions = exam.questions || [];
                    state.status = exam.status === 'published' ? 'published' : 'draft';
                });
            }
        },

        setExamId: (id) => {
            set((state) => {
                state.examId = id;
            });
        },

        setTitle: (title) => {
            set((state) => {
                state.title = title;
            });
        },

        setDescription: (description) => {
            set((state) => {
                state.description = description;
            });
        },

        setQuestions: (questions) => {
            set((state) => {
                state.questions = questions.sort((a, b) => a.orderIndex - b.orderIndex);
            });
        },

        addQuestion: (question) => {
            set((state) => {
                state.questions.push(question);
            });
        },

        updateQuestion: (id, updates) => {
            set((state) => {
                const index = state.questions.findIndex((q) => q.id === id);
                if (index !== -1) {
                    Object.assign(state.questions[index], updates);
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
            });
        },

        saveExam: () => {
            set((state) => {
                const id = saveToLocalStorage(state, 'draft');
                if (id) state.examId = id;
            });
            console.log('Exam saved locally to localStorage.');
            toast.success('Exam saved successfully!');
        },

        publishExam: () => {
            set((state) => {
                state.status = 'published';
            });
            // We need to access state again to save it after status update,
            // but since Zustand `set` modifies the drafted state, we can save it inside set
            set((state) => {
                const id = saveToLocalStorage(state, 'published');
                if (id) state.examId = id;
            });
            console.log('Exam published to localStorage.');
            toast.success('Exam has been published!');
        },
    }))
);

// Helper function to handle saving mock data
function saveToLocalStorage(state: ExamStoreState, statusOverride?: ExamStatus) {
    if (typeof window === 'undefined') return null;
    try {
        const localExamsRaw = localStorage.getItem('sentinel_mock_exams');
        const localExams: Exam[] = localExamsRaw ? JSON.parse(localExamsRaw) : [];
        const examId = state.examId || crypto.randomUUID();
        const existingIndex = localExams.findIndex((e) => e.id === examId);
        
        const examToSave = {
            id: examId,
            title: state.title || 'Untitled Exam',
            description: state.description || '',
            status: statusOverride || state.status,
            duration: 60,
            passingScore: 75,
            subject: 'General Subject',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scheduledDate: new Date().toISOString(),
            questions: state.questions,
            questionCount: state.questions.length,
        };
        
        if (existingIndex !== -1) {
            localExams[existingIndex] = examToSave;
        } else {
            localExams.push(examToSave);
        }
        
        localStorage.setItem('sentinel_mock_exams', JSON.stringify(localExams));
        return examId;
    } catch (e) {
        console.error("Failed to save mock exam", e);
        return null;
    }
}
