import type {
    ExamConfiguration,
    ExamQuestion,
    ExamQuestionSection,
    ExamSettings,
    ProctorExam,
} from '@sentinel/shared/types';

export type ExamStatus = 'draft' | 'published';

export interface ExamStoreState {
    examId: string | null;
    title: string;
    description: string;
    classroomId: string | null;
    classroomName: string | null;
    subjectId: string | null;
    subject: string;
    section: string;
    sectionIds: string[];
    startDateTime: string | null;
    endDateTime: string | null;
    durationMinutes: number;
    passingScore: number;
    settings: ExamSettings;
    configuration: ExamConfiguration;
    questionSections: ExamQuestionSection[];
    questions: ExamQuestion[];
    status: ExamStatus;
    isDirty: boolean;
}

export interface ExamStoreActions {
    hydrateExam: (exam: ProctorExam) => void;
    setSetupDraft: (setup: {
        examId: string;
        title: string;
        description: string;
        classroomId: string | null;
        classroomName: string | null;
        subjectId: string;
        subject: string;
        section: string;
        sectionIds: string[];
        startDateTime: string;
        endDateTime: string;
        durationMinutes: number;
        passingScore: number;
        settings: ExamSettings;
        configuration?: ExamConfiguration;
    }) => void;
    setExamId: (id: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    markClean: () => void;
    updateSetting: <K extends keyof ExamSettings>(key: K, value: ExamSettings[K]) => void;
    updateConfiguration: <K extends keyof ExamConfiguration>(
        key: K,
        value: ExamConfiguration[K],
    ) => void;
    addQuestionSection: (title?: string) => void;
    updateQuestionSection: (sectionId: string, updates: Partial<ExamQuestionSection>) => void;
    deleteQuestionSection: (sectionId: string) => void;
    toggleQuestionSectionCollapse: (sectionId: string) => void;
    reorderQuestionSections: (startIndex: number, endIndex: number) => void;
    setQuestions: (questions: ExamQuestion[]) => void;
    addQuestion: (question: ExamQuestion) => void;
    updateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    deleteQuestion: (id: string) => void;
    reorderQuestions: (startIndex: number, endIndex: number) => void;
    reorderQuestionsInSection: (sectionId: string, startIndex: number, endIndex: number) => void;
}

export type ExamStore = ExamStoreState & ExamStoreActions;
