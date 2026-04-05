'use client';

import { Dialog, DialogContent, PageHeader, Separator } from '@sentinel/ui';
import { QuestionBuilderForm, QuestionTypeSelectorDialog } from '@/features/exams';
import { ImportModal } from '../dialogs/import-modal';
import { DeleteQuestionsDialog } from '../dialogs/delete-questions-dialog';
import { QuestionsTable } from '../tables/questions-table';
import { QuestionsEmptyState } from './questions-empty-state';
import { useQuestionBankPage } from '../../_hooks/use-question-bank-page';

export function QuestionBankPageContent() {
    const questionBankPage = useQuestionBankPage();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Question Bank"
                description="Repository of all questions recorded across your exams."
            />
            <Separator />

            <div className="flex-1">
                {questionBankPage.questions.length > 0 || questionBankPage.isQuestionsLoading ? (
                    <QuestionsTable
                        questions={questionBankPage.questions}
                        isLoading={questionBankPage.isQuestionsLoading}
                        searchValue={questionBankPage.searchQuery}
                        totalCount={questionBankPage.totalQuestions}
                        pageCount={questionBankPage.pageCount}
                        pagination={{
                            pageIndex: questionBankPage.pageIndex,
                            pageSize: questionBankPage.pageSize,
                        }}
                        onSearchChange={questionBankPage.setSearchQuery}
                        onPaginationChange={questionBankPage.setPagination}
                        columnFilters={questionBankPage.columnFilters}
                        onColumnFiltersChange={questionBankPage.setColumnFilters}
                        onEdit={questionBankPage.handleEditQuestion}
                        onDuplicate={questionBankPage.handleDuplicateQuestion}
                        onDelete={questionBankPage.handleDeleteQuestion}
                        onDeleteSelected={questionBankPage.handleDeleteSelectedQuestions}
                        isDeleting={questionBankPage.isDeletingQuestions}
                    />
                ) : (
                    <QuestionsEmptyState
                        onCreate={questionBankPage.handleOpenCreateQuestion}
                        onImport={() => questionBankPage.setIsImportModalOpen(true)}
                        description="Your question bank is currenty empty. Fill it by creating questions manually or importing from documents."
                    />
                )}
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

            <DeleteQuestionsDialog
                open={questionBankPage.isDeleteQuestionsDialogOpen}
                onOpenChange={questionBankPage.setIsDeleteQuestionsDialogOpen}
                questionCount={questionBankPage.questionsPendingDeletion.length}
                questionLabel={
                    questionBankPage.questionsPendingDeletion[0]?.prompt ??
                    questionBankPage.questionsPendingDeletion[0]?.content.prompt
                }
                isDeleting={questionBankPage.isDeletingQuestions}
                onConfirm={() => void questionBankPage.handleConfirmDeleteQuestions()}
            />
        </div>
    );
}
