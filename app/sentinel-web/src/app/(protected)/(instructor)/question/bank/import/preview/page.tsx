'use client';

import { usePreviewManager } from './_hooks/use-preview-manager';
import { PreviewLoadingState } from './_components/layout/preview-loading-state';
import { EditQuestionView } from './_components/views/edit-question-view';
import { PreviewListView } from './_components/views/preview-list-view';

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
        editingIndex,
        currentPage,
        totalPages,
        paginatedQuestions,
        editingQuestion,
        setCurrentPage,
        setEditingIndex,
        handleUpdateQuestion,
        handleToggleQuestion,
        handleToggleSelectAll,
        handleDeleteQuestion,
        handleDiscard,
        handleSave,
    } = usePreviewManager();

    // 1. Loading State
    if (!hasHydrated || isGenerating || !previewData) {
        return <PreviewLoadingState />;
    }

    // 2. Edit View
    if (editingIndex !== null && editingQuestion) {
        return (
            <EditQuestionView
                editingIndex={editingIndex}
                editingQuestion={editingQuestion}
                onBack={() => setEditingIndex(null)}
                onUpdate={handleUpdateQuestion}
            />
        );
    }

    // 3. List View (Default)
    return (
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
            onEdit={setEditingIndex}
            onDelete={handleDeleteQuestion}
            onDiscard={handleDiscard}
            onSave={handleSave}
        />
    );
}
