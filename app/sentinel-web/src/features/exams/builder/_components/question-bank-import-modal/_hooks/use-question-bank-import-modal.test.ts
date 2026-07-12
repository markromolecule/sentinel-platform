import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuestionBankImportModal } from './use-question-bank-import-modal';
import { useQuestionBankImportSelection } from './use-question-bank-import-selection';
import { useQuestionBankImportData } from './use-question-bank-import-data';

vi.mock('./use-question-bank-import-selection', () => ({
    useQuestionBankImportSelection: vi.fn(() => ({
        selectedIds: ['q-1'],
        selectedIdSet: new Set(['q-1']),
        alreadyAddedIds: [],
        alreadyAddedIdSet: new Set(),
        searchQuery: 'algebra',
        selectedQuestionType: 'all',
        selectedCollectionId: 'all',
        currentPage: 1,
        setAlreadyAddedIds: vi.fn(),
        setSearchQuery: vi.fn(),
        setSelectedQuestionType: vi.fn(),
        setSelectedCollectionId: vi.fn(),
        setCurrentPage: vi.fn(),
        toggleQuestion: vi.fn(),
        toggleSelectAllFilteredQuestions: vi.fn(),
        resetState: vi.fn(),
    })),
}));

vi.mock('./use-question-bank-import-data', () => ({
    useQuestionBankImportData: vi.fn(() => ({
        questionRecords: [{ id: 'q-1', prompt: 'Question 1' }],
        collections: [],
        questionTypes: [],
        typeCounts: [],
        selectedCollection: null,
        totalQuestionCount: 1,
        totalPages: 1,
        isQuestionsLoading: false,
        isFetchingMoreQuestions: false,
        isCollectionsLoading: false,
        isQuestionTypesLoading: false,
        isTypeCountsLoading: false,
        isSelectedCollectionLoading: false,
    })),
}));

describe('useQuestionBankImportModal bridge hook', () => {
    it('wires selection and data hooks and returns correct state', () => {
        const { result } = renderHook(() => useQuestionBankImportModal([]));

        expect(result.current.searchQuery).toBe('algebra');
        expect(result.current.questionRecords).toHaveLength(1);
        expect(result.current.currentPage).toBe(1);
        expect(result.current.selectedImportableCount).toBe(1);
    });
});
