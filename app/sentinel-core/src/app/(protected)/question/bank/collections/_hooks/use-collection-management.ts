'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Schema } from '@sentinel/shared';
import {
    useCreateQuestionBankCollectionMutation,
    useDeleteQuestionBankCollectionMutation,
    useQuestionBankCollectionsQuery,
    useStableValue,
    useServerPagination,
} from '@sentinel/hooks';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { COLLECTIONS_PER_PAGE } from '../_constants';
import { ViewMode } from '../_types';

const collectionNameSchema = Schema.createQuestionBankCollectionBodySchema.pick({
    name: true,
});

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

/**
 * Coordinates collection list state, pagination, and mutations.
 */
export function useCollectionManagement() {
    const router = useRouter();
    const [view, setView] = useState<ViewMode>('grid');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [draftCollectionName, setDraftCollectionName] = useState('');
    const [hasDraftCollection, setHasDraftCollection] = useState(false);

    const { pagination, setPagination } = useServerPagination([], {
        pageIndex: 0,
        pageSize: COLLECTIONS_PER_PAGE,
    });

    const currentPage = pagination.pageIndex + 1;
    const setCurrentPage = (page: number) => {
        setPagination((current) => ({
            ...current,
            pageIndex: page - 1,
        }));
    };

    const [collectionIdToDelete, setCollectionIdToDelete] = useState<string | null>(null);

    const { data, isLoading } = useQuestionBankCollectionsQuery({
        page: currentPage,
        pageSize: COLLECTIONS_PER_PAGE,
    });
    const collections = data?.items ?? [];
    const createCollectionMutation = useCreateQuestionBankCollectionMutation();
    const deleteCollectionMutation = useDeleteQuestionBankCollectionMutation();

    const handleImport = () => setIsImportModalOpen(true);

    const handleAddCollection = () => {
        if (hasDraftCollection) return;
        setHasDraftCollection(true);
        setDraftCollectionName('');
        setCurrentPage(1);
    };

    const handleSaveCollection = async () => {
        const trimmedName = draftCollectionName.trim();
        const parsedName = collectionNameSchema.safeParse({
            name: trimmedName,
        });

        if (!parsedName.success) {
            toast.error(parsedName.error.issues[0]?.message ?? 'Invalid collection title.');
            return;
        }

        try {
            await createCollectionMutation.mutateAsync({
                name: parsedName.data.name,
                isPublic: false,
            });
            setHasDraftCollection(false);
            setDraftCollectionName('');
            setCurrentPage(1);
        } catch {
            // Mutation toasts handle errors
        }
    };

    const handleCancelDraftCollection = () => {
        setHasDraftCollection(false);
        setDraftCollectionName('');
    };

    const handleOpenCollection = (id: string) => {
        router.push(`/question/bank/collections/${id}`);
    };

    const handleConfirmDelete = async () => {
        if (!collectionIdToDelete) return;
        try {
            await deleteCollectionMutation.mutateAsync(collectionIdToDelete);
            setCollectionIdToDelete(null);
        } catch {
            // Mutation toasts handle errors
        }
    };

    const mappedCollections = useStableValue(
        () =>
            collections.map((collection) => ({
                id: collection.id,
                name: collection.name,
                description: collection.description,
                lastUpdated: formatCollectionUpdatedAt(collection.updatedAt),
                questionCount: collection.questionCount,
                isPublic: collection.isPublic,
                author: collection.createdBy,
                createdById: collection.createdById,
                updatedById: collection.updatedById,
            })),
        [collections],
    );

    const paginatedCollections = useStableValue(() => {
        if (hasDraftCollection && currentPage === 1) {
            return [
                {
                    id: '__draft__',
                    name: draftCollectionName,
                    description: null,
                    lastUpdated: '',
                    questionCount: 0,
                    isPublic: false,
                    createdById: null,
                    updatedById: null,
                    author: null,
                },
                ...mappedCollections,
            ];
        }
        return mappedCollections;
    }, [draftCollectionName, hasDraftCollection, mappedCollections, currentPage]);

    const totalPages = Math.max(1, data?.totalPages ?? 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);

    return {
        // State
        view,
        setView,
        isImportModalOpen,
        setIsImportModalOpen,
        draftCollectionName,
        setDraftCollectionName,
        hasDraftCollection,
        currentPage: safeCurrentPage,
        setCurrentPage,
        collectionIdToDelete,
        setCollectionIdToDelete,

        // Data
        paginatedCollections,
        totalPages,
        isLoading,
        isSaving: createCollectionMutation.isPending,
        isDeleting: deleteCollectionMutation.isPending,

        // Handlers
        handleImport,
        handleAddCollection,
        handleSaveCollection,
        handleCancelDraftCollection,
        handleOpenCollection,
        handleConfirmDelete,
    };
}
