"use client";

import { Separator } from "@sentinel/ui";
import { useState } from "react";
import { useExamBuilder } from "../hooks/use-exam-builder";
import { ExamBuilderHeader } from "./exam-builder-header";
import { ExamBuilderSidebar } from "./exam-builder-sidebar";
import { ExamBuilderWorkspace } from "./exam-builder-workspace";

export function ExamBuilderScreen() {
    const builder = useExamBuilder();
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
                        handleSave={builder.handleSave}
                        handlePublish={builder.handlePublish}
                    />

                    <Separator />

                    <ExamBuilderWorkspace
                        activeQuestionType={builder.activeQuestionType}
                        editingQuestion={builder.editingQuestion}
                        questionSections={builder.questionSections}
                        questions={builder.questions}
                        isTypeSelectorOpen={builder.isTypeSelectorOpen}
                        setIsTypeSelectorOpen={builder.setIsTypeSelectorOpen}
                        handleSelectQuestionType={builder.handleSelectQuestionType}
                        handleCreateQuestion={builder.handleCreateQuestion}
                        handleDuplicateQuestion={builder.handleDuplicateQuestion}
                        handleEditQuestion={builder.handleEditQuestion}
                        handleUpdateQuestion={builder.handleUpdateQuestion}
                        handleDeleteQuestion={builder.handleDeleteQuestion}
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
