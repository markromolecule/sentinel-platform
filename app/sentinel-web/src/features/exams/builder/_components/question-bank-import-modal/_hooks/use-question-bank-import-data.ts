'use client';

import { useDeferredValue, useMemo } from 'react';
import {
    useQuestionBankCollectionsQuery,
    useInfiniteQuestionsQuery,
} from '@sentinel/hooks';
import { ALL_COLLECTIONS_ID } from '../constants';

export function useQuestionBankImportData(selectedCollectionId: string, searchQuery: string) {
    const deferredSearchQuery = useDeferredValue(searchQuery.trim());
    const { data: collections = [], isLoading: isCollectionsLoading } =
        useQuestionBankCollectionsQuery();
    const questionQuery = useInfiniteQuestionsQuery({
        search: deferredSearchQuery || undefined,
        collectionId:
            selectedCollectionId !== ALL_COLLECTIONS_ID ? selectedCollectionId : undefined,
        pageSize: 20,
    });

    const selectedCollection = useMemo(
        () =>
            selectedCollectionId === ALL_COLLECTIONS_ID
                ? null
                : collections.find((collection) => collection.id === selectedCollectionId) ?? null,
        [collections, selectedCollectionId],
    );

    const questionRecords = useMemo(
        () => questionQuery.data?.pages.flatMap((page) => page.items) ?? [],
        [questionQuery.data?.pages],
    );

    const totalQuestionCount = questionQuery.data?.pages[0]?.total ?? 0;

    return {
        questionRecords,
        collections,
        selectedCollection,
        totalQuestionCount,
        hasMoreQuestions: Boolean(questionQuery.hasNextPage),
        isFetchingMoreQuestions: questionQuery.isFetchingNextPage,
        isQuestionsLoading: questionQuery.isLoading,
        isCollectionsLoading,
        isSelectedCollectionLoading: false,
        fetchNextQuestionsPage: questionQuery.fetchNextPage,
    };
}
