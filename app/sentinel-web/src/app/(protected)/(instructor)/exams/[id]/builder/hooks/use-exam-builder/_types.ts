import { type QuestionType, type ExamQuestion } from "@sentinel/shared/types";
import { type QuestionBuilderPayload } from "@/features/exams/builder/_components/_types";

export type UseExamBuilderResult = {
    title: string;
    description: string | null;
    status: "draft" | "published" | string;
    questions: ExamQuestion[];
    titleParam: string;
    isTypeSelectorOpen: boolean;
    activeQuestionType: QuestionType | null;
    editingQuestion: ExamQuestion | null;
    setIsTypeSelectorOpen: (open: boolean) => void;
    handleSelectQuestionType: (type: QuestionType) => void;
    handleCreateQuestion: (payload: QuestionBuilderPayload) => void;
    handleDuplicateQuestion: (payload: QuestionBuilderPayload) => void;
    handleEditQuestion: (id: string) => void;
    handleUpdateQuestion: (id: string, payload: QuestionBuilderPayload) => void;
    handleDeleteQuestion: (id: string) => void;
    handleImportQuestions: (questions: ExamQuestion[]) => void;
    handleBackFromBuilder: () => void;
    handleSave: () => void;
    handlePublish: () => void;
};
