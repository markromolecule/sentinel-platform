'use client';

import { useRef } from 'react';
import { Dialog, DialogContent } from '@sentinel/ui';
import { CollectionSidebar } from './question-bank-import-modal/_components/collection-sidebar';
import { ImportModalFooter } from './question-bank-import-modal/_components/import-modal-footer';
import { ImportModalHeader } from './question-bank-import-modal/_components/import-modal-header';
import { QuestionsPanel } from './question-bank-import-modal/_components/questions-panel';
import { useQuestionBankImportModal } from './question-bank-import-modal/_hooks/use-question-bank-import-modal';
import type { QuestionBankImportModalProps } from './question-bank-import-modal/types';

export function QuestionBankImportModal({
    open,
    onOpenChange,
    onImport,
    existingQuestions = [],
}: QuestionBankImportModalProps) {
    const questionsScrollContainerRef = useRef<HTMLDivElement | null>(null);
    const modal = useQuestionBankImportModal(existingQuestions);

    const handleImport = () => {
        onImport(modal.buildImportedQuestions());
        onOpenChange(false);
        modal.resetState({
            preserveAlreadyAddedIds: existingQuestions.flatMap((question) =>
                question.sourceQuestionBankQuestionId ? [question.sourceQuestionBankQuestionId] : [],
            ),
        });
    };

    const handleCancel = () => {
        modal.resetState({
            preserveAlreadyAddedIds: existingQuestions.flatMap((question) =>
                question.sourceQuestionBankQuestionId ? [question.sourceQuestionBankQuestionId] : [],
            ),
        });
        onOpenChange(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            handleCancel();
            return;
        }

        onOpenChange(true);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex h-[82vh] min-h-0 w-[95vw] flex-col overflow-hidden rounded-xl border p-0 sm:max-w-6xl">
                <ImportModalHeader selectedCount={modal.selectedImportableCount} />

                <div className="flex min-h-0 flex-1 overflow-hidden">
                    <CollectionSidebar
                        collections={modal.collections}
                        questionCount={modal.questionRecords.length}
                        selectedCollectionId={modal.selectedCollectionId}
                        isCollectionsLoading={modal.isCollectionsLoading}
                        onSelectCollection={modal.setSelectedCollectionId}
                    />

                    <QuestionsPanel
                        selectedCollection={modal.selectedCollection}
                        questionTypes={modal.questionTypes}
                        searchQuery={modal.searchQuery}
                        selectedQuestionType={modal.selectedQuestionType}
                        questionRecords={modal.questionRecords}
                        selectedIds={modal.selectedIds}
                        alreadyAddedIds={modal.alreadyAddedIds}
                        totalQuestionCount={modal.totalQuestionCount}
                        hasMoreQuestions={modal.hasMoreQuestions}
                        isFetchingMoreQuestions={modal.isFetchingMoreQuestions}
                        isQuestionsLoading={modal.isQuestionsLoading}
                        isQuestionTypesLoading={modal.isQuestionTypesLoading}
                        isSelectedCollectionLoading={modal.isSelectedCollectionLoading}
                        questionsScrollContainerRef={questionsScrollContainerRef}
                        onSearchChange={modal.setSearchQuery}
                        onQuestionTypeChange={modal.setSelectedQuestionType}
                        onToggleSelectAll={modal.toggleSelectAllFilteredQuestions}
                        onToggleQuestion={modal.toggleQuestion}
                        onLoadMore={() => void modal.fetchNextQuestionsPage()}
                    />
                </div>

                <ImportModalFooter
                    selectedCount={modal.selectedImportableCount}
                    onCancel={handleCancel}
                    onImport={handleImport}
                />
            </DialogContent>
        </Dialog>
    );
}
