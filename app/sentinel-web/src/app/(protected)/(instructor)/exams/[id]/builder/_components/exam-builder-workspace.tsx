"use client";

import * as React from "react";
import {
    QuestionBankImportModal,
    QuestionBucketTable,
    QuestionBuilderForm,
    QuestionTypeSelectorDialog,
} from "@/features/exams";
import type { UseExamBuilderResult } from "../hooks/use-exam-builder/_types";

type ExamBuilderWorkspaceProps = Pick<
    UseExamBuilderResult,
    | "activeQuestionType"
    | "activeQuestionTypeDefinition"
    | "editingQuestion"
    | "questionSections"
    | "questions"
    | "questionTypes"
    | "isQuestionTypesLoading"
    | "isTypeSelectorOpen"
    | "setIsTypeSelectorOpen"
    | "handleSelectQuestionType"
    | "handleCreateQuestion"
    | "handleDuplicateQuestion"
    | "handleEditQuestion"
    | "handleUpdateQuestion"
    | "handleDeleteQuestion"
    | "handleAddQuestionSection"
    | "handleUpdateQuestionSection"
    | "handleDeleteQuestionSection"
    | "handleToggleQuestionSectionCollapse"
    | "handleReorderQuestionSections"
    | "handleReorderQuestionsInSection"
    | "handleImportQuestions"
    | "handleBackFromBuilder"
> & {
    isImportModalOpen: boolean;
    setIsImportModalOpen: (open: boolean) => void;
};

export function ExamBuilderWorkspace({
    activeQuestionType,
    activeQuestionTypeDefinition,
    editingQuestion,
    questionSections,
    questions,
    questionTypes,
    isQuestionTypesLoading,
    isTypeSelectorOpen,
    setIsTypeSelectorOpen,
    handleSelectQuestionType,
    handleCreateQuestion,
    handleDuplicateQuestion,
    handleEditQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleAddQuestionSection,
    handleUpdateQuestionSection,
    handleDeleteQuestionSection,
    handleToggleQuestionSectionCollapse,
    handleReorderQuestionSections,
    handleReorderQuestionsInSection,
    handleImportQuestions,
    handleBackFromBuilder,
    isImportModalOpen,
    setIsImportModalOpen,
}: ExamBuilderWorkspaceProps) {
    const [targetSectionId, setTargetSectionId] = React.useState<string | undefined>();

    return (
        <>
            <div className="min-w-0">
                {activeQuestionType ? (
                    <QuestionBuilderForm
                        key={`${activeQuestionType}-${editingQuestion?.id || "new"}`}
                        type={activeQuestionType}
                        initialData={editingQuestion || undefined}
                        questionTypeDefinition={activeQuestionTypeDefinition}
                        onBack={() => {
                            setTargetSectionId(undefined);
                            handleBackFromBuilder();
                        }}
                        onCreate={(payload) => handleCreateQuestion(payload, targetSectionId)}
                        onUpdate={handleUpdateQuestion}
                        onDuplicate={(payload) =>
                            handleDuplicateQuestion(payload, targetSectionId || editingQuestion?.sectionId)
                        }
                    />
                ) : (
                    <ExamStructureSection
                        questionSections={questionSections}
                        questions={questions}
                        onAddQuestion={(sectionId) => {
                            setTargetSectionId(sectionId);
                            setIsTypeSelectorOpen(true);
                        }}
                        onAddSection={handleAddQuestionSection}
                        onImportQuestions={(sectionId) => {
                            setTargetSectionId(sectionId);
                            setIsImportModalOpen(true);
                        }}
                        onEditQuestion={handleEditQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        onUpdateSection={handleUpdateQuestionSection}
                        onDeleteSection={handleDeleteQuestionSection}
                        onToggleSectionCollapse={handleToggleQuestionSectionCollapse}
                        onReorderSections={handleReorderQuestionSections}
                        onReorderQuestions={handleReorderQuestionsInSection}
                    />
                )}
            </div>

            <QuestionTypeSelectorDialog
                open={isTypeSelectorOpen}
                onOpenChange={(open) => {
                    setIsTypeSelectorOpen(open);
                    if (!open) {
                        setTargetSectionId(undefined);
                    }
                }}
                questionTypes={questionTypes}
                isLoading={isQuestionTypesLoading}
                onSelect={handleSelectQuestionType}
            />

            <QuestionBankImportModal
                open={isImportModalOpen}
                onOpenChange={(open) => {
                    setIsImportModalOpen(open);
                    if (!open) {
                        setTargetSectionId(undefined);
                    }
                }}
                onImport={(importedQuestions) => handleImportQuestions(importedQuestions, targetSectionId)}
            />
        </>
    );
}

function ExamStructureSection({
    questionSections,
    questions,
    onAddQuestion,
    onAddSection,
    onImportQuestions,
    onEditQuestion,
    onDeleteQuestion,
    onUpdateSection,
    onDeleteSection,
    onToggleSectionCollapse,
    onReorderSections,
    onReorderQuestions,
}: {
    questionSections: UseExamBuilderResult["questionSections"];
    questions: UseExamBuilderResult["questions"];
    onAddQuestion: (sectionId?: string) => void;
    onAddSection: UseExamBuilderResult["handleAddQuestionSection"];
    onImportQuestions: (sectionId?: string) => void;
    onEditQuestion: UseExamBuilderResult["handleEditQuestion"];
    onDeleteQuestion: UseExamBuilderResult["handleDeleteQuestion"];
    onUpdateSection: UseExamBuilderResult["handleUpdateQuestionSection"];
    onDeleteSection: UseExamBuilderResult["handleDeleteQuestionSection"];
    onToggleSectionCollapse: UseExamBuilderResult["handleToggleQuestionSectionCollapse"];
    onReorderSections: UseExamBuilderResult["handleReorderQuestionSections"];
    onReorderQuestions: UseExamBuilderResult["handleReorderQuestionsInSection"];
}) {
    return (
        <div className="space-y-4">
            <QuestionBucketTable
                sections={questionSections}
                questions={questions}
                onAdd={onAddQuestion}
                onAddSection={onAddSection}
                onImport={onImportQuestions}
                onEdit={onEditQuestion}
                onDelete={onDeleteQuestion}
                onUpdateSection={onUpdateSection}
                onDeleteSection={onDeleteSection}
                onToggleSectionCollapse={onToggleSectionCollapse}
                onReorderSections={onReorderSections}
                onReorderInSection={onReorderQuestions}
            />
        </div>
    );
}
