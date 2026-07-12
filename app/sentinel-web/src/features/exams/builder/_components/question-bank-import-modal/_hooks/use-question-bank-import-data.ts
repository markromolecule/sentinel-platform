'use client';

import { useDeferredValue, useMemo, useState, useEffect } from 'react';
import {
    useQuestionBankCollectionsQuery,
    useQuestionsQuery,
    useQuestionTypeCountsQuery,
    useQuestionTypesQuery,
} from '@sentinel/hooks';
import type { QuestionType } from '@sentinel/shared/types';
import { ALL_COLLECTIONS_ID, QUESTION_IMPORT_PAGE_SIZE } from '../constants';
import type { QuestionRecord } from '@sentinel/services';

/**
 * Loads import modal data using the paginated and faceted questions responses.
 * Accumulates questions on the client side for infinite scrolling.
 */
export function useQuestionBankImportData(
    selectedCollectionId: string,
    searchQuery: string,
    selectedQuestionType: QuestionType | 'all',
    currentPage: number,
) {
    const deferredSearchQuery = useDeferredValue(searchQuery.trim());
    const { data, isLoading: isCollectionsLoading } = useQuestionBankCollectionsQuery();
    const collections = data?.items ?? [];
    const { data: questionTypes = [], isLoading: isQuestionTypesLoading } = useQuestionTypesQuery();

    const questionQuery = useQuestionsQuery({
        search: deferredSearchQuery || undefined,
        type: selectedQuestionType !== 'all' ? selectedQuestionType : undefined,
        collectionId:
            selectedCollectionId !== ALL_COLLECTIONS_ID ? selectedCollectionId : undefined,
        page: currentPage,
        pageSize: QUESTION_IMPORT_PAGE_SIZE,
    });

    const typeCountsQuery = useQuestionTypeCountsQuery({
        search: deferredSearchQuery || undefined,
        collectionId:
            selectedCollectionId !== ALL_COLLECTIONS_ID ? selectedCollectionId : undefined,
    });

    const selectedCollection = useMemo(
        () =>
            selectedCollectionId === ALL_COLLECTIONS_ID
                ? null
                : (collections.find((collection) => collection.id === selectedCollectionId) ??
                  null),
        [collections, selectedCollectionId],
    );

    const [accumulatedQuestions, setAccumulatedQuestions] = useState<QuestionRecord[]>([]);

    // Reset accumulated questions when filters change
    const filterKey = `${deferredSearchQuery}-${selectedQuestionType}-${selectedCollectionId}`;
    useEffect(() => {
        setAccumulatedQuestions([]);
    }, [filterKey]);

    const newItems = questionQuery.data?.items ?? [];

    useEffect(() => {
        if (newItems.length > 0) {
            setAccumulatedQuestions((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const filteredNew = newItems.filter((item) => !existingIds.has(item.id));

                if (currentPage === 1) {
                    return newItems;
                }
                return [...prev, ...filteredNew];
            });
        }
    }, [newItems, currentPage]);

    const totalQuestionCount = questionQuery.data?.total ?? 0;
    const totalPages = questionQuery.data?.totalPages ?? 0;
    const typeCounts = typeCountsQuery.data?.items ?? [];

    const isQuestionsLoading = currentPage === 1 && questionQuery.isFetching;
    const isFetchingMoreQuestions = currentPage > 1 && questionQuery.isFetching;

    return {
        questionRecords: isQuestionsLoading ? [] : accumulatedQuestions,
        collections,
        questionTypes,
        typeCounts,
        selectedCollection,
        totalQuestionCount,
        totalPages,
        isQuestionsLoading,
        isFetchingMoreQuestions,
        isCollectionsLoading,
        isQuestionTypesLoading,
        isTypeCountsLoading: typeCountsQuery.isLoading,
        isSelectedCollectionLoading: false,
    };
}
