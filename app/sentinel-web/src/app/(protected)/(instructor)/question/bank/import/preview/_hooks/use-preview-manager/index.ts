'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAiImportStore } from '@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store';
import { UsePreviewManagerReturn } from './_types';
import { transformAiQuestionToExamQuestion } from './_utils';
import { usePreviewSelection } from './use-preview-selection';
import { usePreviewPagination } from './use-preview-pagination';
import { usePreviewActions } from './use-preview-actions';

/**
 * Main orchestrator hook for the AI Import Preview page.
 *
 * Logic is decomposed into focused sub-hooks:
 * - Pagination: Handles page state and slicing dataset.
 * - Selection: Handles checkbox state and bulk actions.
 * - Actions: Handles updates, deletes, and final save API calls.
 */
export function usePreviewManager(): UsePreviewManagerReturn {
    const router = useRouter();
    const { previewData, isGenerating, hasHydrated } = useAiImportStore();

    // 1. Decomposed State Handlers
    const { currentPage, totalPages, paginatedQuestions, currentPageIndexes, setCurrentPage } =
        usePreviewPagination(previewData, hasHydrated);

    const { selectedQuestions, handleToggleQuestion, handleToggleSelectAll, handleDeleteQuestion } =
        usePreviewSelection(previewData, hasHydrated, currentPageIndexes);

    const { isSaving, editingIndex, setEditingIndex, handleUpdateQuestion, handleSave } =
        usePreviewActions(previewData, selectedQuestions);

    // 2. Navigation Guards
    useEffect(() => {
        if (!hasHydrated) return;

        // Redirect back if user lands on preview directly without data
        if (!previewData && !isGenerating && !isSaving) {
            toast.error('No preview data found. Please start the import process again.');
            router.push('/question/bank');
        }
    }, [hasHydrated, previewData, isGenerating, isSaving, router]);

    // 3. Computed Formatting (Derived state)
    const editingQuestion = useMemo(() => {
        if (editingIndex === null || !previewData) return null;
        return transformAiQuestionToExamQuestion(editingIndex, previewData);
    }, [editingIndex, previewData]);

    return {
        // State
        previewData,
        isGenerating,
        isSaving,
        hasHydrated,
        selectedQuestions,
        editingIndex,
        currentPage,

        // Computed
        totalPages,
        paginatedQuestions,
        editingQuestion,

        // Handlers
        setCurrentPage,
        setEditingIndex,
        handleUpdateQuestion,
        handleToggleQuestion,
        handleToggleSelectAll,
        handleDeleteQuestion,
        handleSave,
    };
}
