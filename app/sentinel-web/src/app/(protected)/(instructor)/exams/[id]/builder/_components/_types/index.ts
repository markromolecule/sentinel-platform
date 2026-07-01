import { UseExamBuilderResult } from '../../hooks/use-exam-builder/_types';

export type ExamBuilderWorkspaceProps = Pick<
    UseExamBuilderResult,
    | 'activeQuestionType'
    | 'activeQuestionTypeDefinition'
    | 'editingQuestion'
    | 'questionSections'
    | 'questions'
    | 'questionTypes'
    | 'isQuestionTypesLoading'
    | 'isTypeSelectorOpen'
    | 'setIsTypeSelectorOpen'
    | 'handleSelectQuestionType'
    | 'handleCreateQuestion'
    | 'handleDuplicateQuestion'
    | 'handleEditQuestion'
    | 'handleUpdateQuestion'
    | 'handleDeleteQuestion'
    | 'handleAddQuestionToBank'
    | 'handleAddQuestionSection'
    | 'handleUpdateQuestionSection'
    | 'handleDeleteQuestionSection'
    | 'handleToggleQuestionSectionCollapse'
    | 'handleReorderQuestionSections'
    | 'handleReorderQuestionsInSection'
    | 'handleImportQuestions'
    | 'handleBackFromBuilder'
> & {
    isImportModalOpen: boolean;
    setIsImportModalOpen: (open: boolean) => void;
};

export type ExamBuilderSidebarProps = Pick<
    UseExamBuilderResult,
    | 'settings'
    | 'configuration'
    | 'handleToggleExamSetting'
    | 'handleToggleLobbyAdmissionMode'
    | 'handleToggleReleaseScoreMode'
>;
