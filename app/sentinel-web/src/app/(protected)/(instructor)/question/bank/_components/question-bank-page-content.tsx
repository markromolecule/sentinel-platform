'use client';

import { Button, Dialog, DialogContent, PageHeader, Separator } from '@sentinel/ui';
import { Plus, Upload } from 'lucide-react';
import { QuestionBuilderForm, QuestionTypeSelectorDialog } from '@/features/exams';
import { ImportModal } from './import-modal';
import { QuestionsTable } from './questions-table';
import { useQuestionBankPage } from '../_hooks/use-question-bank-page';

export function QuestionBankPageContent() {
    const questionBankPage = useQuestionBankPage();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Question Bank"
                description="Repository of all questions recorded across your exams."
            >
                <div className="flex gap-2">
                    <Button
                        onClick={questionBankPage.handleOpenCreateQuestion}
                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Question
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => questionBankPage.setIsImportModalOpen(true)}
                        className="gap-2"
                    >
                        <Upload className="h-4 w-4" />
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
                <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto">
                    {questionBankPage.activeQuestionType ? (
                        <QuestionBuilderForm
                            key={`${questionBankPage.activeQuestionType}-${questionBankPage.editingQuestion?.id ?? 'new'}`}
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
