'use client';

import type { QuestionBankImportModalState } from '../types';
import { buildImportedExamQuestions } from '../utils';
import { useQuestionBankImportData } from './use-question-bank-import-data';
import { useQuestionBankImportSelection } from './use-question-bank-import-selection';

export function useQuestionBankImportModal(): QuestionBankImportModalState {
    const selection = useQuestionBankImportSelection();
    const data = useQuestionBankImportData(
        selection.selectedCollectionId,
        selection.searchQuery,
    );

    const buildImportedQuestions = () =>
        buildImportedExamQuestions(data.questionRecords, selection.selectedIdSet);

        return {
            questionRecords: data.questionRecords,
            collections: data.collections,
            selectedCollection: data.selectedCollection,
            selectedCollectionId: selection.selectedCollectionId,
            selectedIds: selection.selectedIds,
            searchQuery: selection.searchQuery,
            totalQuestionCount: data.totalQuestionCount,
            hasMoreQuestions: data.hasMoreQuestions,
            isFetchingMoreQuestions: data.isFetchingMoreQuestions,
            isQuestionsLoading: data.isQuestionsLoading,
            isCollectionsLoading: data.isCollectionsLoading,
            isSelectedCollectionLoading: data.isSelectedCollectionLoading,
            setSearchQuery: selection.setSearchQuery,
            setSelectedCollectionId: selection.setSelectedCollectionId,
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
