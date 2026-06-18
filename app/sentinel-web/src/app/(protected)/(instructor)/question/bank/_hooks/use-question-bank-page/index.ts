'use client';

import { useState } from 'react';
import type { UseQuestionBankPageResult } from './_types';
import { useQuestionBankFilters } from './_hooks/use-question-bank-filters';
import { useQuestionBankBuilder } from './_hooks/use-question-bank-builder';
import { useQuestionBankDeletion } from './_hooks/use-question-bank-deletion';

export function useQuestionBankPage(): UseQuestionBankPageResult {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const filters = useQuestionBankFilters();
    const builder = useQuestionBankBuilder();
    const deletion = useQuestionBankDeletion();

    return {
        // From Filters Hook
        questions: filters.questions,
        totalQuestions: filters.totalQuestions,
        pageCount: filters.pageCount,
        pageIndex: filters.pageIndex,
        pageSize: filters.pageSize,
        searchQuery: filters.searchQuery,
        columnFilters: filters.columnFilters,
        isQuestionsLoading: filters.isQuestionsLoading,
        setSearchQuery: filters.setSearchQuery,
        setPagination: filters.setPagination,
        setColumnFilters: filters.setColumnFilters,

        // From Builder Hook
        questionTypes: builder.questionTypes,
        activeQuestionType: builder.activeQuestionType,
        activeQuestionTypeDefinition: builder.activeQuestionTypeDefinition,
        isQuestionBuilderOpen: builder.isQuestionBuilderOpen,
        isTypeSelectorOpen: builder.isTypeSelectorOpen,
        isQuestionTypesLoading: builder.isQuestionTypesLoading,
        handleOpenCreateQuestion: builder.handleOpenCreateQuestion,
        handleSelectQuestionType: builder.handleSelectQuestionType,
        handleCloseQuestionBuilder: builder.handleCloseQuestionBuilder,
        handleCreateQuestion: builder.handleCreateQuestion,
        handleUpdateQuestion: builder.handleUpdateQuestion,
        handleDuplicateQuestionPayload: builder.handleDuplicateQuestionPayload,
        handleEditQuestion: builder.handleEditQuestion,
        handleDuplicateQuestion: builder.handleDuplicateQuestion,
        setIsTypeSelectorOpen: builder.setIsTypeSelectorOpen,

        // From Deletion Hook
        isDeleteQuestionsDialogOpen: deletion.isDeleteQuestionsDialogOpen,
        questionsPendingDeletion: deletion.questionsPendingDeletion,
        isDeletingQuestions: deletion.isDeletingQuestions,
        handleDeleteQuestion: deletion.handleDeleteQuestion,
        handleDeleteSelectedQuestions: deletion.handleDeleteSelectedQuestions,
        handleConfirmDeleteQuestions: deletion.handleConfirmDeleteQuestions,
        setIsDeleteQuestionsDialogOpen: deletion.setIsDeleteQuestionsDialogOpen,

        // Page Exclusive State
        isImportModalOpen,
        setIsImportModalOpen,
    };
}
