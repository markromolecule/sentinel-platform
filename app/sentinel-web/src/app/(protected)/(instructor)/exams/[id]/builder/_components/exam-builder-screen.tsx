'use client';

import { useState } from 'react';
import { useExamBuilder } from '../hooks/use-exam-builder';
import { ExamBuilderWorkspaceShell } from './layout/exam-builder-workspace-shell';
import { ExamBuilderHeader, ExamBuilderSidebar, ExamBuilderWorkspace } from './';

/**
 * ExamBuilderScreen coordinates the exam builder shell, sidebar, and workspace content.
 *
 * @returns The rendered exam builder screen.
 */
export function ExamBuilderScreen() {
    const builder = useExamBuilder();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    if (builder.isWorkspaceLoading) {
        return (
            <ExamBuilderWorkspaceShell
                sidebar={
                    <div className="space-y-4">
                        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                        <div className="space-y-3">
                            <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
                            <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
                        </div>
                    </div>
                }
            >
                <main className="border-border/60 bg-background flex min-h-[calc(100vh-2.5rem)] items-center justify-center rounded-xl border border-dashed">
                    <div className="flex flex-col items-center gap-3">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        <p className="text-muted-foreground text-sm">
                            Loading builder workspace...
                        </p>
                    </div>
                </main>
            </ExamBuilderWorkspaceShell>
        );
    }

    return (
        <ExamBuilderWorkspaceShell
            sidebar={
                <ExamBuilderSidebar
                    settings={builder.settings}
                    configuration={builder.configuration}
                    handleToggleExamSetting={builder.handleToggleExamSetting}
                    handleToggleLobbyAdmissionMode={builder.handleToggleLobbyAdmissionMode}
                />
            }
        >
            <div className="min-w-0 space-y-4">
                <ExamBuilderHeader
                    title={builder.title}
                    titleParam={builder.titleParam}
                    status={builder.status}
                    isSaving={builder.isSaving}
                    isPublishing={builder.isPublishing}
                    isUpdatingTitle={builder.isUpdatingTitle}
                    handleUpdateTitle={builder.handleUpdateTitle}
                    handleSave={builder.handleSave}
                    handlePublish={builder.handlePublish}
                />

                <ExamBuilderWorkspace
                    activeQuestionType={builder.activeQuestionType}
                    activeQuestionTypeDefinition={builder.activeQuestionTypeDefinition}
                    editingQuestion={builder.editingQuestion}
                    questionSections={builder.questionSections}
                    questions={builder.questions}
                    questionTypes={builder.questionTypes}
                    isQuestionTypesLoading={builder.isQuestionTypesLoading}
                    isTypeSelectorOpen={builder.isTypeSelectorOpen}
                    setIsTypeSelectorOpen={builder.setIsTypeSelectorOpen}
                    handleSelectQuestionType={builder.handleSelectQuestionType}
                    handleCreateQuestion={builder.handleCreateQuestion}
                    handleDuplicateQuestion={builder.handleDuplicateQuestion}
                    handleEditQuestion={builder.handleEditQuestion}
                    handleUpdateQuestion={builder.handleUpdateQuestion}
                    handleDeleteQuestion={builder.handleDeleteQuestion}
                    handleAddQuestionToBank={builder.handleAddQuestionToBank}
                    handleAddQuestionSection={builder.handleAddQuestionSection}
                    handleUpdateQuestionSection={builder.handleUpdateQuestionSection}
                    handleDeleteQuestionSection={builder.handleDeleteQuestionSection}
                    handleToggleQuestionSectionCollapse={
                        builder.handleToggleQuestionSectionCollapse
                    }
                    handleReorderQuestionSections={builder.handleReorderQuestionSections}
                    handleReorderQuestionsInSection={builder.handleReorderQuestionsInSection}
                    handleImportQuestions={builder.handleImportQuestions}
                    handleBackFromBuilder={builder.handleBackFromBuilder}
                    isImportModalOpen={isImportModalOpen}
                    setIsImportModalOpen={setIsImportModalOpen}
                />
            </div>
        </ExamBuilderWorkspaceShell>
    );
}
