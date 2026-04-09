"use client";

import { Separator } from "@sentinel/ui";
import { useState } from "react";
import { useExamBuilder } from "../hooks/use-exam-builder";
import {
    ExamBuilderHeader,
    ExamBuilderSidebar,
    ExamBuilderWorkspace
} from "./";

export function ExamBuilderScreen() {
    const builder = useExamBuilder();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    if (builder.isWorkspaceLoading) {
        return (
            <div className="min-h-screen p-4 md:p-5">
                <main className="flex min-h-[calc(100vh-2.5rem)] items-center justify-center rounded-xl border border-dashed border-border/60 bg-background">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Loading builder workspace...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-5">
            <main className="grid min-h-[calc(100vh-2.5rem)] gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-0">
                <ExamBuilderSidebar
                    settings={builder.settings}
                    handleToggleExamSetting={builder.handleToggleExamSetting}
                />

                <div className="min-w-0 space-y-4 xl:pl-5">
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

                    <Separator />

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
                        handleToggleQuestionSectionCollapse={builder.handleToggleQuestionSectionCollapse}
                        handleReorderQuestionSections={builder.handleReorderQuestionSections}
                        handleReorderQuestionsInSection={builder.handleReorderQuestionsInSection}
                        handleImportQuestions={builder.handleImportQuestions}
                        handleBackFromBuilder={builder.handleBackFromBuilder}
                        isImportModalOpen={isImportModalOpen}
                        setIsImportModalOpen={setIsImportModalOpen}
                    />
                </div>
            </main>
        </div>
    );
}
