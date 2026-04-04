'use client';

import { Separator } from '@sentinel/ui';
import { CollectionHeader } from './collection-header';
import { CollectionsPagination } from './collections-pagination';
import { CollectionViewControls } from './collection-view-controls';
import { CollectionList } from './collection-list';
import { DeleteCollectionDialog } from '../dialogs/delete-collection-dialog';
import { useCollectionManagement } from '../../_hooks/use-collection-management';

/**
 * QuestionBankCollectionsPageContent - Refactored version
 * 
 * Orchestrates the collection management view by composing smaller, 
 * focused components and delegating logic to a specialized hook.
 */
export function QuestionBankCollectionsPageContent() {
    const {
        view,
        setView,
        draftCollectionName,
        setDraftCollectionName,
        hasDraftCollection,
        currentPage,
        setCurrentPage,
        collectionIdToDelete,
        setCollectionIdToDelete,
        paginatedCollections,
        totalPages,
        isSaving,
        isDeleting,
        handleAddCollection,
        handleSaveCollection,
        handleCancelDraftCollection,
        handleOpenCollection,
        handleConfirmDelete,
    } = useCollectionManagement();

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <CollectionHeader
                onAddCollection={handleAddCollection}
            />

            <Separator />

            <CollectionViewControls
                view={view}
                onViewChange={setView}
            />

            <CollectionList
                collections={paginatedCollections}
                view={view}
                onOpen={handleOpenCollection}
                onDelete={setCollectionIdToDelete}
                hasDraft={hasDraftCollection}
                draftName={draftCollectionName}
                onDraftNameChange={setDraftCollectionName}
                onDraftSave={handleSaveCollection}
                onDraftCancel={handleCancelDraftCollection}
                isSavingDraft={isSaving}
                onAddCollection={handleAddCollection}
            />

            <CollectionsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <DeleteCollectionDialog
                open={!!collectionIdToDelete}
                onOpenChange={(open) => !open && setCollectionIdToDelete(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
