import { ExamQuestion } from '@sentinel/shared/types';
import { GenerateQuestionPreviewResponse } from '@sentinel/shared';
import { PreviewQuestion } from '../../_types';

export interface UsePreviewManagerReturn {
    // State
    previewData: GenerateQuestionPreviewResponse | null;
    isGenerating: boolean;
    isSaving: boolean;
    isDiscarding: boolean;
    hasHydrated: boolean;
    selectedQuestions: Set<number>;
    editingIndex: number | null;
    currentPage: number;

    // Summary state
    showSummary: boolean;
    summaryData: {
        total: number;
        typeBreakdown: Record<string, number>;
        difficultyBreakdown: Record<string, number>;
    } | null;
    saveTargetName: string;

    // Computed
    totalPages: number;
    paginatedQuestions: PreviewQuestion[];
    editingQuestion: ExamQuestion | null;

    // Handlers
    setCurrentPage: (page: number) => void;
    setEditingIndex: (index: number | null) => void;
    handleEditQuestion: (index: number) => void;
    setShowSummary: (show: boolean) => void;
    handleUpdateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    handleToggleQuestion: (index: number) => void;
    handleToggleSelectAll: () => void;
    handleDeleteQuestion: (index: number) => void;
    handleDiscard: () => void;
    handleSave: () => Promise<void>;
    handleConfirmSummary: () => void;
}
