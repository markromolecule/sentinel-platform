'use client';

import { useDeferredValue, useMemo } from 'react';
import {
    useQuestionBankCollectionsQuery,
    useInfiniteQuestionsQuery,
    useQuestionTypesQuery,
} from '@sentinel/hooks';
import type { QuestionType } from '@sentinel/shared/types';
import { ALL_COLLECTIONS_ID } from '../constants';

/**
 * Loads import modal data using the paginated question bank collections response.
 */
export function useQuestionBankImportData(
    selectedCollectionId: string,
    searchQuery: string,
    selectedQuestionType: QuestionType | 'all',
) {
    const deferredSearchQuery = useDeferredValue(searchQuery.trim());
    const { data, isLoading: isCollectionsLoading } =
        useQuestionBankCollectionsQuery();
    const collections = data?.items ?? [];
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();
    const questionQuery = useInfiniteQuestionsQuery({
        search: deferredSearchQuery || undefined,
        type: selectedQuestionType !== 'all' ? selectedQuestionType : undefined,
        collectionId:
            selectedCollectionId !== ALL_COLLECTIONS_ID ? selectedCollectionId : undefined,
        pageSize: 20,
    });

    const selectedCollection = useMemo(
        () =>
            selectedCollectionId === ALL_COLLECTIONS_ID
                ? null
                : (collections.find((collection) => collection.id === selectedCollectionId) ??
                  null),
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
        questionTypes,
        selectedCollection,
        totalQuestionCount,
        hasMoreQuestions: Boolean(questionQuery.hasNextPage),
        isFetchingMoreQuestions: questionQuery.isFetchingNextPage,
        isQuestionsLoading: questionQuery.isLoading,
        isCollectionsLoading,
        isQuestionTypesLoading,
        isSelectedCollectionLoading: false,
        fetchNextQuestionsPage: questionQuery.fetchNextPage,
    };
}
