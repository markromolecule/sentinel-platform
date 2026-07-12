import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { QuestionBankImportModal } from './question-bank-import-modal';

afterEach(() => {
    cleanup();
});

vi.mock('./question-bank-import-modal/_hooks/use-question-bank-import-modal', () => ({
    useQuestionBankImportModal: () => ({
        questionRecords: [],
        collections: [],
        questionTypes: [],
        typeCounts: [],
        selectedCollection: null,
        selectedCollectionId: 'all',
        selectedIds: [],
        selectedIdSet: new Set(),
        alreadyAddedIds: [],
        alreadyAddedIdSet: new Set(),
        searchQuery: '',
        selectedQuestionType: 'all',
        selectedImportableCount: 0,
        totalQuestionCount: 0,
        currentPage: 1,
        totalPages: 1,
        isQuestionsLoading: false,
        isCollectionsLoading: false,
        isQuestionTypesLoading: false,
        isTypeCountsLoading: false,
        isSelectedCollectionLoading: false,
        setSearchQuery: vi.fn(),
        setSelectedCollectionId: vi.fn(),
        setSelectedQuestionType: vi.fn(),
        setCurrentPage: vi.fn(),
        toggleQuestion: vi.fn(),
        toggleSelectAllFilteredQuestions: vi.fn(),
        buildImportedQuestions: () => [],
        resetState: vi.fn(),
    }),
}));

describe('QuestionBankImportModal component', () => {
    it('renders dialog elements when open is true', () => {
        render(
            <QuestionBankImportModal
                open={true}
                onOpenChange={vi.fn()}
                onImport={vi.fn()}
                existingQuestions={[]}
            />,
        );

        expect(screen.getByText('Import Questions from Question Bank')).toBeTruthy();
    });
});
