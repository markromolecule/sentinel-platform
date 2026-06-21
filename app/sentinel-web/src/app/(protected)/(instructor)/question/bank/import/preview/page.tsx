'use client';

import { usePreviewManager } from './_hooks/use-preview-manager';
import { PreviewLoadingState } from './_components/layout/preview-loading-state';
import { PreviewListView } from './_components/views/preview-list-view';
import { ImportSummaryDialog } from './_components/dialogs/import-summary-dialog';

/**
 * AI Import Preview Page
 *
 * This page allows instructors to review, edit, and select AI-generated questions
 * before importing them into the question bank or a collection.
 *
 * Logic is encapsulated in the usePreviewManager hook for maintainability.
 */
export default function AiImportPreviewPage() {
    const {
        previewData,
        isGenerating,
        isSaving,
        isDiscarding,
        hasHydrated,
        selectedQuestions,
        currentPage,
        totalPages,
        paginatedQuestions,
        setCurrentPage,
        handleToggleQuestion,
        handleToggleSelectAll,
        handleDeleteQuestion,
        handleDiscard,
        handleSave,
        showSummary,
        summaryData,
        saveTargetName,
        setShowSummary,
        handleConfirmSummary,
        handleEditQuestion,
    } = usePreviewManager();

    // 1. Loading State
    if (!hasHydrated || isGenerating || !previewData) {
        return <PreviewLoadingState />;
    }

    // 2. Default List View (Edit view is handled via route-based builder)
    return (
        <>
            <PreviewListView
                previewData={previewData}
                isSaving={isSaving}
                isDiscarding={isDiscarding}
                selectedQuestions={selectedQuestions}
                currentPage={currentPage}
                paginatedQuestions={paginatedQuestions}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onToggleSelect={handleToggleQuestion}
                onToggleSelectAll={handleToggleSelectAll}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onDiscard={handleDiscard}
                onSave={handleSave}
            />

            {summaryData && (
                <ImportSummaryDialog
                    open={showSummary}
                    onOpenChange={setShowSummary}
                    onConfirm={handleConfirmSummary}
                    summary={summaryData}
                    targetName={saveTargetName}
                />
            )}
        </>
    );
}
