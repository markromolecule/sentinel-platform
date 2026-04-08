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
}: QuestionBankImportModalProps) {
    const questionsScrollContainerRef = useRef<HTMLDivElement | null>(null);
    const modal = useQuestionBankImportModal();

    const handleImport = () => {
        onImport(modal.buildImportedQuestions());
        onOpenChange(false);
        modal.resetState();
    };

    const handleCancel = () => {
        modal.resetState();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[82vh] min-h-0 w-[95vw] flex-col overflow-hidden rounded-xl border p-0 sm:max-w-6xl">
                <ImportModalHeader selectedCount={modal.selectedIds.length} />

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
                        searchQuery={modal.searchQuery}
                        questionRecords={modal.questionRecords}
                        selectedIds={modal.selectedIds}
                        totalQuestionCount={modal.totalQuestionCount}
                        hasMoreQuestions={modal.hasMoreQuestions}
                        isFetchingMoreQuestions={modal.isFetchingMoreQuestions}
                        isQuestionsLoading={modal.isQuestionsLoading}
                        isSelectedCollectionLoading={modal.isSelectedCollectionLoading}
                        questionsScrollContainerRef={questionsScrollContainerRef}
                        onSearchChange={modal.setSearchQuery}
                        onToggleSelectAll={modal.toggleSelectAllFilteredQuestions}
                        onToggleQuestion={modal.toggleQuestion}
                        onLoadMore={() => void modal.fetchNextQuestionsPage()}
                    />
                </div>

                <ImportModalFooter
                    selectedCount={modal.selectedIds.length}
                    onCancel={handleCancel}
                    onImport={handleImport}
                />
            </DialogContent>
        </Dialog>
    );
}
