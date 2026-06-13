'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStableValue } from '@sentinel/hooks';
import { useAiImportStore } from '@/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store';
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

    const {
        isSaving,
        isDiscarding,
        editingIndex,
        showSummary,
        summaryData,
        saveTargetName,
        setEditingIndex,
        setShowSummary,
        handleUpdateQuestion,
        handleDiscard,
        handleSave,
        handleConfirmSummary,
    } = usePreviewActions(previewData, selectedQuestions);

    // 2. Navigation Guards
    const wasSavingRef = useRef(false);

    useEffect(() => {
        if (!hasHydrated) return;

        // If we were saving and now we aren't, and data is gone, we've successfully imported and are redirecting.
        if (wasSavingRef.current && !isSaving && !previewData) {
            return;
        }

        // If we have summary data, we are in the success flow, don't trigger the "no data" error
        if (showSummary || summaryData) {
            return;
        }

        wasSavingRef.current = isSaving;

        // Redirect back if user lands on preview directly without data
        if (!previewData && !isGenerating && !isSaving && !isDiscarding && !showSummary) {
            toast.error('No preview data found. Please start the import process again.');
            router.push('/question/bank');
        }
    }, [
        hasHydrated,
        previewData,
        isGenerating,
        isSaving,
        isDiscarding,
        showSummary,
        summaryData,
        router,
    ]);

    // 3. Computed Formatting (Derived state)
    const editingQuestion = useStableValue(() => {
        if (editingIndex === null || !previewData) return null;
        return transformAiQuestionToExamQuestion(editingIndex, previewData);
    }, [editingIndex, previewData]);

    return {
        // State
        previewData,
        isGenerating,
        isSaving,
        isDiscarding,
        hasHydrated,
        selectedQuestions,
        editingIndex,
        showSummary,
        summaryData,
        saveTargetName,
        currentPage,

        // Computed
        totalPages,
        paginatedQuestions,
        editingQuestion,

        // Handlers
        setCurrentPage,
        setEditingIndex,
        setShowSummary,
        handleUpdateQuestion,
        handleToggleQuestion,
        handleToggleSelectAll,
        handleDeleteQuestion,
        handleDiscard,
        handleSave,
        handleConfirmSummary,
    };
}
