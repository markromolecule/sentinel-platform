'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    useCreateQuestionBankCollectionMutation,
    useQuestionBankCollectionsQuery,
} from '@sentinel/hooks';
import { Separator } from '@sentinel/ui';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ImportModal } from '@/app/(protected)/(instructor)/question/bank/_components/import-modal';
import { CollectionCard } from './collection-card';
import { CollectionDraftCard } from './collection-draft-card';
import { CollectionHeader } from './collection-header';
import { CollectionListItem } from './collection-list-item';
import { CollectionsPagination } from './collections-pagination';
import { CollectionViewControls } from './collection-view-controls';
import { ViewMode } from '@/app/(protected)/(instructor)/question/bank/collections/_types';

const COLLECTIONS_PER_PAGE = 8;

function formatCollectionUpdatedAt(updatedAt: string | Date | null) {
    if (!updatedAt) {
        return 'recently';
    }

    const parsedDate = new Date(updatedAt);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'recently';
    }

    return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function QuestionBankCollectionsPageContent() {
    const router = useRouter();
    const [view, setView] = useState<ViewMode>('grid');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [draftCollectionName, setDraftCollectionName] = useState('');
    const [hasDraftCollection, setHasDraftCollection] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { data: collections = [] } = useQuestionBankCollectionsQuery();
    const createCollectionMutation = useCreateQuestionBankCollectionMutation();

    const handleImport = () => setIsImportModalOpen(true);

    const handleAddCollection = () => {
        if (hasDraftCollection) {
            return;
        }

        setHasDraftCollection(true);
        setDraftCollectionName('');
        setCurrentPage(1);
    };

    const handleSaveCollection = () => {
        const trimmedName = draftCollectionName.trim();

        if (!trimmedName) {
            toast.error('Collection title is required.');
            return;
        }

        void (async () => {
            try {
                await createCollectionMutation.mutateAsync({
                    name: trimmedName,
                    isPublic: false,
                });
                setHasDraftCollection(false);
                setDraftCollectionName('');
                setCurrentPage(1);
            } catch {
                // Mutation toasts already surface the error state.
            }
        })();
    };

    const handleCancelDraftCollection = () => {
        setHasDraftCollection(false);
        setDraftCollectionName('');
    };

    const handleOpenCollection = (id: string) => {
        router.push(`/question/bank/collections/${id}`);
    };

    const mappedCollections = useMemo(
        () =>
            collections.map((collection) => ({
                id: collection.id,
                name: collection.name,
                description: collection.description,
                lastUpdated: formatCollectionUpdatedAt(collection.updatedAt),
                questionCount: collection.questionCount,
                isPublic: collection.isPublic,
            })),
        [collections],
    );

    const collectionsWithDraft = useMemo(() => {
        if (!hasDraftCollection) {
            return mappedCollections;
        }

        return [
            {
                id: '__draft__',
                name: draftCollectionName,
                lastUpdated: '',
                questionCount: 0,
                isPublic: false,
            },
            ...mappedCollections,
        ];
    }, [draftCollectionName, hasDraftCollection, mappedCollections]);

    const totalPages = Math.max(1, Math.ceil(collectionsWithDraft.length / COLLECTIONS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedCollections = useMemo(() => {
        const start = (safeCurrentPage - 1) * COLLECTIONS_PER_PAGE;
        return collectionsWithDraft.slice(start, start + COLLECTIONS_PER_PAGE);
    }, [collectionsWithDraft, safeCurrentPage]);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <CollectionHeader onImport={handleImport} onAddCollection={handleAddCollection} />

            <Separator />

            <CollectionViewControls view={view} onViewChange={setView} />

            <div
                className={
                    view === 'grid'
                        ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'flex flex-col gap-2'
                }
            >
                {paginatedCollections.map((collection) => {
                    if (collection.id === '__draft__') {
                        return (
                            <CollectionDraftCard
                                key="__draft__"
                                name={draftCollectionName}
                                view={view}
                                onNameChange={setDraftCollectionName}
                                onSave={handleSaveCollection}
                                onCancel={handleCancelDraftCollection}
                                isSaving={createCollectionMutation.isPending}
                            />
                        );
                    }

                    return view === 'grid' ? (
                        <CollectionCard
                            key={collection.id}
                            collection={collection}
                            onClick={() => handleOpenCollection(collection.id)}
                        />
                    ) : (
                        <CollectionListItem
                            key={collection.id}
                            collection={collection}
                            onOpen={() => handleOpenCollection(collection.id)}
                        />
                    );
                })}
            </div>

            <CollectionsPagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            <ImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
        </div>
    );
}
