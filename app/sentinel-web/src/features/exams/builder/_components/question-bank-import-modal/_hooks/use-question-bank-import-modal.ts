'use client';

import { useEffect, useMemo } from 'react';
import type { ExamQuestion } from '@sentinel/shared/types';
import { ALL_COLLECTIONS_ID } from '../constants';
import type { QuestionBankImportModalState } from '../types';
import { buildImportedExamQuestions } from '../utils';
import { useQuestionBankImportData } from './use-question-bank-import-data';
import { useQuestionBankImportSelection } from './use-question-bank-import-selection';

export function useQuestionBankImportModal(
    existingQuestions: ExamQuestion[] = [],
): QuestionBankImportModalState {
    const selection = useQuestionBankImportSelection();
    const alreadyAddedIds = useMemo(
        () =>
            existingQuestions.flatMap((question) =>
                question.sourceQuestionBankQuestionId
                    ? [question.sourceQuestionBankQuestionId]
                    : [],
            ),
        [existingQuestions],
    );

    useEffect(() => {
        selection.setAlreadyAddedIds(alreadyAddedIds);
    }, [alreadyAddedIds, selection]);

    const data = useQuestionBankImportData(
        selection.selectedCollectionId,
        selection.searchQuery,
        selection.selectedQuestionType,
    );

    const buildImportedQuestions = () =>
        buildImportedExamQuestions(
            data.questionRecords,
            selection.selectedIdSet,
            selection.selectedCollectionId !== ALL_COLLECTIONS_ID
                ? selection.selectedCollectionId
                : undefined,
        );

    return {
        questionRecords: data.questionRecords,
        collections: data.collections,
        questionTypes: data.questionTypes,
        selectedCollection: data.selectedCollection,
        selectedCollectionId: selection.selectedCollectionId,
        selectedIds: selection.selectedIds,
        selectedIdSet: selection.selectedIdSet,
        alreadyAddedIds: selection.alreadyAddedIds,
        alreadyAddedIdSet: selection.alreadyAddedIdSet,
        searchQuery: selection.searchQuery,
        selectedQuestionType: selection.selectedQuestionType,
        selectedImportableCount: selection.selectedIds.length,
        totalQuestionCount: data.totalQuestionCount,
        hasMoreQuestions: data.hasMoreQuestions,
        isFetchingMoreQuestions: data.isFetchingMoreQuestions,
        isQuestionsLoading: data.isQuestionsLoading,
        isCollectionsLoading: data.isCollectionsLoading,
        isQuestionTypesLoading: data.isQuestionTypesLoading,
        isSelectedCollectionLoading: data.isSelectedCollectionLoading,
        setSearchQuery: selection.setSearchQuery,
        setSelectedCollectionId: selection.setSelectedCollectionId,
        setSelectedQuestionType: selection.setSelectedQuestionType,
        toggleQuestion: selection.toggleQuestion,
        toggleSelectAllFilteredQuestions: () =>
            selection.toggleSelectAllFilteredQuestions(
                data.questionRecords.map((question) => question.id),
            ),
        fetchNextQuestionsPage: data.fetchNextQuestionsPage,
        buildImportedQuestions,
        resetState: selection.resetState,
    };
}
