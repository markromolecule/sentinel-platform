import { useDeferredValue, useState } from 'react';
import type { ColumnFiltersState, ColumnFilter } from '@tanstack/react-table';
import { useQuestionsQuery, useStableValue, useServerPagination } from '@sentinel/hooks';
import type { QuestionType, QuestionDifficulty } from '@sentinel/shared/types';

export function useQuestionBankFilters() {
    const [searchQuery, setSearchQueryState] = useState('');
    const [columnFilters, setColumnFiltersState] = useState<ColumnFiltersState>([]);

    const deferredSearchQuery = useDeferredValue(searchQuery);
    const { pagination, setPagination } = useServerPagination([deferredSearchQuery, columnFilters]);

    const typeFilter = useStableValue(
        () =>
            columnFilters.find((f: ColumnFilter) => f.id === 'type')?.value as
                QuestionType | undefined,
        [columnFilters],
    );

    const difficultyFilter = useStableValue(
        () =>
            columnFilters.find((f: ColumnFilter) => f.id === 'difficulty')?.value as
                QuestionDifficulty | undefined,
        [columnFilters],
    );

    const {
        data: questionsPage,
        isLoading,
        isFetching,
    } = useQuestionsQuery({
        search: deferredSearchQuery || undefined,
        type: typeFilter,
        difficulty: difficultyFilter,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
    });

    const setSearchQuery = (value: string) => {
        setSearchQueryState(value);
    };

    const setColumnFilters = (nextFilters: ColumnFiltersState) => {
        setColumnFiltersState(nextFilters);
    };

    return {
        questions: questionsPage?.items ?? [],
        totalQuestions: questionsPage?.total ?? 0,
        pageCount: questionsPage?.totalPages ?? 0,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        searchQuery,
        columnFilters,
        isQuestionsLoading: isLoading || isFetching,
        setSearchQuery,
        setPagination,
        setColumnFilters,
    };
}
