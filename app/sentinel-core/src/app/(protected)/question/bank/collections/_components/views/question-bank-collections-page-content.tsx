'use client';

import { useState } from 'react';
import { useAuth } from '@sentinel/hooks';
import { Separator } from '@sentinel/ui';
import { QuestionBankPageShell } from '../../../../_components/layout';
import { CollectionHeader } from '@/app/(protected)/question/bank/collections/_components/views/collection-header';
import { CollectionsPagination } from '@/app/(protected)/question/bank/collections/_components/views/collections-pagination';
import { CollectionViewControls } from '@/app/(protected)/question/bank/collections/_components/views/collection-view-controls';
import { CollectionList } from '@/app/(protected)/question/bank/collections/_components/views/collection-list';
import { DeleteCollectionDialog } from '@/app/(protected)/question/bank/collections/_components/dialogs/delete-collection-dialog';
import { EditCollectionDialog } from '@/app/(protected)/question/bank/collections/_components/dialogs/edit-collection-dialog';
import { ShareCollectionDialog } from '@/app/(protected)/question/bank/collections/_components/dialogs/share-collection-dialog';
import { useCollectionManagement } from '@/app/(protected)/question/bank/collections/_hooks/use-collection-management';
import type { Collection } from '@/app/(protected)/question/bank/collections/_types';

/**
 * Orchestrates the collection management view by composing smaller,
 * focused components and delegating logic to a specialized hook.
 */
export function QuestionBankCollectionsPageContent() {
    const { user } = useAuth();
    const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);
    const [collectionToShare, setCollectionToShare] = useState<Collection | null>(null);
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
        <QuestionBankPageShell>
            <CollectionHeader onAddCollection={handleAddCollection} />

            <Separator />

            <CollectionViewControls view={view} onViewChange={setView} />

            <CollectionList
                collections={paginatedCollections}
                view={view}
                onOpen={handleOpenCollection}
                onDelete={setCollectionIdToDelete}
                onEdit={setCollectionToEdit}
                onShare={setCollectionToShare}
                currentUserId={user?.id ?? null}
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

            <EditCollectionDialog
                open={!!collectionToEdit}
                onOpenChange={(open) => !open && setCollectionToEdit(null)}
                collectionId={collectionToEdit?.id}
                initialName={collectionToEdit?.name}
                initialDescription={collectionToEdit?.description}
                initialIsPublic={collectionToEdit?.isPublic}
            />

            <ShareCollectionDialog
                open={!!collectionToShare}
                onOpenChange={(open) => !open && setCollectionToShare(null)}
                collectionId={collectionToShare?.id}
                collectionName={collectionToShare?.name}
                currentUserId={user?.id ?? null}
            />
        </QuestionBankPageShell>
    );
}
