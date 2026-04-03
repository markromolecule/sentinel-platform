"use client";

import { PageHeader, Separator, Button, Dialog, DialogContent } from "@sentinel/ui";
import { Plus, Upload } from "lucide-react";
import { ImportModal } from "./import-modal";
import { QuestionTypeSelectorDialog, QuestionBuilderForm } from "@/features/exams";
import { QuestionsTable } from "./questions-table";
import { useQuestionBankPage } from "../_hooks/use-question-bank-page";

export function QuestionBankPageContent() {
    const questionBankPage = useQuestionBankPage();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Question Bank"
                description="Repository of all questions recorded across your exams."
            >
                <div className="flex gap-2">
                    <Button
                        onClick={questionBankPage.handleOpenCreateQuestion}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Question
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => questionBankPage.setIsImportModalOpen(true)}
                        className="gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import / Upload
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <div className="flex-1">
                <QuestionsTable
                    questions={questionBankPage.questions}
                    isLoading={questionBankPage.isQuestionsLoading}
                    onEdit={questionBankPage.handleEditQuestion}
                    onDuplicate={questionBankPage.handleDuplicateQuestion}
                    onDelete={questionBankPage.handleDeleteQuestion}
                    onDeleteSelected={questionBankPage.handleDeleteSelectedQuestions}
                />
            </div>

            <QuestionTypeSelectorDialog
                open={questionBankPage.isTypeSelectorOpen}
                onOpenChange={questionBankPage.setIsTypeSelectorOpen}
                questionTypes={questionBankPage.questionTypes}
                isLoading={questionBankPage.isQuestionTypesLoading}
                onSelect={questionBankPage.handleSelectQuestionType}
            />

            <Dialog
                open={questionBankPage.isQuestionBuilderOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        questionBankPage.handleCloseQuestionBuilder();
                    }
                }}
            >
                <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
                    {questionBankPage.activeQuestionType ? (
                        <QuestionBuilderForm
                            key={`${questionBankPage.activeQuestionType}-${questionBankPage.editingQuestion?.id ?? "new"}`}
                            type={questionBankPage.activeQuestionType}
                            initialData={questionBankPage.editingQuestion ?? undefined}
                            questionTypeDefinition={questionBankPage.activeQuestionTypeDefinition}
                            onBack={questionBankPage.handleCloseQuestionBuilder}
                            onCreate={questionBankPage.handleCreateQuestion}
                            onUpdate={questionBankPage.handleUpdateQuestion}
                            onDuplicate={questionBankPage.handleDuplicateQuestionPayload}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            <ImportModal
                open={questionBankPage.isImportModalOpen}
                onOpenChange={questionBankPage.setIsImportModalOpen}
            />
        </div>
    );
}
