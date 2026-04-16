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

    // Computed
    totalPages: number;
    paginatedQuestions: PreviewQuestion[];
    editingQuestion: ExamQuestion | null;

    // Handlers
    setCurrentPage: (page: number) => void;
    setEditingIndex: (index: number | null) => void;
    handleUpdateQuestion: (id: string, updates: Partial<ExamQuestion>) => void;
    handleToggleQuestion: (index: number) => void;
    handleToggleSelectAll: () => void;
    handleDeleteQuestion: (index: number) => void;
    handleDiscard: () => void;
    handleSave: () => Promise<void>;
}
