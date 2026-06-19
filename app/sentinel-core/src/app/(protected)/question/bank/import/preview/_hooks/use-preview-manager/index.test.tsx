import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    pushMock: vi.fn(),
    toastErrorMock: vi.fn(),
    previewState: {
        previewData: null as { questions: Array<{ id: string }> } | null,
        isGenerating: false,
        hasHydrated: true,
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mocks.pushMock }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: mocks.toastErrorMock,
    },
}));

vi.mock('@sentinel/hooks', () => ({
    useStableValue: (factory: () => unknown) => factory(),
}));

vi.mock(
    '@/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store',
    () => ({
        useAiImportStore: () => mocks.previewState,
    }),
);

vi.mock('./use-preview-pagination', () => ({
    usePreviewPagination: () => ({
        currentPage: 1,
        totalPages: 1,
        paginatedQuestions: [],
        currentPageIndexes: [],
        setCurrentPage: vi.fn(),
    }),
}));

vi.mock('./use-preview-selection', () => ({
    usePreviewSelection: () => ({
        selectedQuestions: [],
        handleToggleQuestion: vi.fn(),
        handleToggleSelectAll: vi.fn(),
        handleDeleteQuestion: vi.fn(),
    }),
}));

vi.mock('./use-preview-actions', () => ({
    usePreviewActions: () => ({
        isSaving: false,
        isDiscarding: false,
        editingIndex: null,
        showSummary: false,
        summaryData: null,
        saveTargetName: '',
        setEditingIndex: vi.fn(),
        setShowSummary: vi.fn(),
        handleUpdateQuestion: vi.fn(),
        handleDiscard: vi.fn(),
        handleSave: vi.fn(),
        handleConfirmSummary: vi.fn(),
    }),
}));

import { usePreviewManager } from './index';

describe('usePreviewManager', () => {
    beforeEach(() => {
        mocks.pushMock.mockReset();
        mocks.toastErrorMock.mockReset();
        mocks.previewState = {
            previewData: null,
            isGenerating: false,
            hasHydrated: true,
        };
    });

    it('redirects away when preview data is missing', async () => {
        renderHook(() => usePreviewManager());

        await waitFor(() => {
            expect(mocks.toastErrorMock).toHaveBeenCalledWith(
                'No preview data found. Please start the import process again.',
            );
        });
        expect(mocks.pushMock).toHaveBeenCalledWith('/question/bank');
    });

    it('routes edit actions into the dedicated builder page', () => {
        mocks.previewState = {
            previewData: { questions: [{ id: 'question-1' }] },
            isGenerating: false,
            hasHydrated: true,
        };

        const { result } = renderHook(() => usePreviewManager());

        act(() => {
            result.current.handleEditQuestion(3);
        });

        expect(mocks.pushMock).toHaveBeenCalledWith('/question/bank/import/preview/3/builder');
    });
});
