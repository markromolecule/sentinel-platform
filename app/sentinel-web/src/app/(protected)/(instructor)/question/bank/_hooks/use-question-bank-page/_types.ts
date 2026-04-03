import type { QuestionRecord, QuestionTypeDefinition } from '@sentinel/services';
import type { ExamQuestion, QuestionType } from '@sentinel/shared/types';
import type { QuestionBuilderPayload } from '@/features/exams/builder/_components/_types';

export type UseQuestionBankPageResult = {
    questions: QuestionRecord[];
    questionTypes: QuestionTypeDefinition[];
    activeQuestionType: QuestionType | null;
    activeQuestionTypeDefinition?: QuestionTypeDefinition;
    editingQuestion: ExamQuestion | null;
    isQuestionsLoading: boolean;
    isQuestionTypesLoading: boolean;
    isImportModalOpen: boolean;
    isQuestionBuilderOpen: boolean;
    isTypeSelectorOpen: boolean;
    setIsImportModalOpen: (open: boolean) => void;
    setIsTypeSelectorOpen: (open: boolean) => void;
    handleOpenCreateQuestion: () => void;
    handleSelectQuestionType: (type: QuestionType) => void;
    handleCloseQuestionBuilder: () => void;
    handleCreateQuestion: (payload: QuestionBuilderPayload) => Promise<void>;
    handleUpdateQuestion: (id: string, payload: QuestionBuilderPayload) => Promise<void>;
    handleDuplicateQuestionPayload: (payload: QuestionBuilderPayload) => Promise<void>;
    handleEditQuestion: (question: QuestionRecord) => void;
    handleDuplicateQuestion: (question: QuestionRecord) => Promise<void>;
    handleDeleteQuestion: (question: QuestionRecord) => Promise<void>;
    handleDeleteSelectedQuestions: (questions: QuestionRecord[]) => Promise<void>;
};
