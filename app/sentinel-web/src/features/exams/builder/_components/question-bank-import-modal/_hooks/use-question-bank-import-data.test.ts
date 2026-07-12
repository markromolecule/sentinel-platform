import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuestionBankImportData } from './use-question-bank-import-data';
import { useQuestionsQuery, useQuestionTypeCountsQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useQuestionBankCollectionsQuery: vi.fn(() => ({
        data: { items: [] },
        isLoading: false,
    })),
    useQuestionsQuery: vi.fn(() => ({
        data: { items: [], total: 10, totalPages: 1 },
        isLoading: false,
        isFetching: false,
    })),
    useQuestionTypeCountsQuery: vi.fn(() => ({
        data: { items: [] },
        isLoading: false,
    })),
    useQuestionTypesQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
    })),
}));

describe('useQuestionBankImportData', () => {
    it('queries questions and type counts with correct parameters', () => {
        const { result } = renderHook(() =>
            useQuestionBankImportData('coll-1', 'geometry', 'MULTIPLE_CHOICE', 2),
        );

        expect(useQuestionsQuery).toHaveBeenCalledWith({
            search: 'geometry',
            type: 'MULTIPLE_CHOICE',
            collectionId: 'coll-1',
            page: 2,
            pageSize: 20,
        });

        expect(useQuestionTypeCountsQuery).toHaveBeenCalledWith({
            search: 'geometry',
            collectionId: 'coll-1',
        });

        expect(result.current.totalQuestionCount).toBe(10);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.isFetchingMoreQuestions).toBe(false);
    });
});
