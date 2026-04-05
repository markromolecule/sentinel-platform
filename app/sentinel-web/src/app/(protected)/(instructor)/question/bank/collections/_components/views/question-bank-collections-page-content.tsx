'use client';

import { Separator } from '@sentinel/ui';
import { CollectionHeader } from '@/app/(protected)/(instructor)/question/bank/collections/_components/views/collection-header';
import { CollectionsPagination } from '@/app/(protected)/(instructor)/question/bank/collections/_components/views/collections-pagination';
import { CollectionViewControls } from '@/app/(protected)/(instructor)/question/bank/collections/_components/views/collection-view-controls';
import { CollectionList } from '@/app/(protected)/(instructor)/question/bank/collections/_components/views/collection-list';
import { DeleteCollectionDialog } from '@/app/(protected)/(instructor)/question/bank/collections/_components/dialogs/delete-collection-dialog';
import { useCollectionManagement } from '@/app/(protected)/(instructor)/question/bank/collections/_hooks/use-collection-management';

/**
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
        handleAddCollection,
        handleSaveCollection,
        handleCancelDraftCollection,
        handleOpenCollection,
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
                collectionId={collectionIdToDelete ?? undefined}
                onSuccess={() => setCollectionIdToDelete(null)}
            />
        </div>
    );
}
