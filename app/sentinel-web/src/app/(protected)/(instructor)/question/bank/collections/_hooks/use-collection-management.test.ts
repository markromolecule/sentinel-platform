import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollectionManagement } from './use-collection-management';
import {
    useCreateQuestionBankCollectionMutation,
    useDeleteQuestionBankCollectionMutation,
    useQuestionBankCollectionsQuery,
} from '@sentinel/hooks';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

vi.mock('@sentinel/hooks', () => ({
    useCreateQuestionBankCollectionMutation: vi.fn(),
    useDeleteQuestionBankCollectionMutation: vi.fn(),
    useQuestionBankCollectionsQuery: vi.fn(),
    useStableValue: (fn: () => any) => fn(),
    useServerPagination: vi.fn((watchDeps, initialState = { pageIndex: 0, pageSize: 10 }) => {
        const [pagination, setPagination] = require('react').useState(initialState);
        return { pagination, setPagination };
    }),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('useCollectionManagement', () => {
    const mockMutateAsyncCreate = vi.fn();
    const mockMutateAsyncDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCreateQuestionBankCollectionMutation).mockReturnValue({
            mutateAsync: mockMutateAsyncCreate,
            isPending: false,
        } as any);
        vi.mocked(useDeleteQuestionBankCollectionMutation).mockReturnValue({
            mutateAsync: mockMutateAsyncDelete,
            isPending: false,
        } as any);
    });

    it('returns server-paginated collections and totalPages from query hook', () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [
                    {
                        id: 'collection-1',
                        name: 'Math Collection',
                        description: 'Math problems',
                        updatedAt: '2026-06-20T10:00:00Z',
                        questionCount: 5,
                        isPublic: false,
                        createdById: 'user-1',
                        updatedById: 'user-1',
                        creatorFirstName: 'John',
                        creatorLastName: 'Doe',
                    },
                ],
                totalPages: 3,
                total: 24,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        expect(useQuestionBankCollectionsQuery).toHaveBeenCalledWith({
            page: 1,
            pageSize: 8,
        });
        expect(result.current.paginatedCollections).toHaveLength(1);
        expect(result.current.paginatedCollections[0]).toEqual({
            id: 'collection-1',
            name: 'Math Collection',
            description: 'Math problems',
            lastUpdated: expect.any(String),
            questionCount: 5,
            isPublic: false,
            createdById: 'user-1',
            updatedById: 'user-1',
            author: 'John Doe',
        });
        expect(result.current.totalPages).toBe(3);
    });

    it('supports prepending draft collections on page 1', () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.handleAddCollection();
        });

        expect(result.current.hasDraftCollection).toBe(true);
        expect(result.current.paginatedCollections).toHaveLength(1);
        expect(result.current.paginatedCollections[0].id).toBe('__draft__');

        act(() => {
            result.current.setDraftCollectionName('New Draft Collection');
        });

        expect(result.current.paginatedCollections[0].name).toBe('New Draft Collection');
    });

    it('triggers createCollectionMutation and resets draft state on save', async () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.handleAddCollection();
            result.current.setDraftCollectionName('Calculus Prep');
        });

        await act(async () => {
            await result.current.handleSaveCollection();
        });

        expect(mockMutateAsyncCreate).toHaveBeenCalledWith({
            name: 'Calculus Prep',
            isPublic: false,
        });
        expect(result.current.hasDraftCollection).toBe(false);
    });

    it('validates draft collection name length before saving', async () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.handleAddCollection();
            result.current.setDraftCollectionName(''); // empty name
        });

        await act(async () => {
            await result.current.handleSaveCollection();
        });

        expect(mockMutateAsyncCreate).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
    });

    it('handles cancel draft collection', () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.handleAddCollection();
            result.current.setDraftCollectionName('Physics Collection');
        });

        act(() => {
            result.current.handleCancelDraftCollection();
        });

        expect(result.current.hasDraftCollection).toBe(false);
        expect(result.current.draftCollectionName).toBe('');
    });

    it('handles delete collection confirmation', async () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.setCollectionIdToDelete('collection-to-delete');
        });

        await act(async () => {
            await result.current.handleConfirmDelete();
        });

        expect(mockMutateAsyncDelete).toHaveBeenCalledWith('collection-to-delete');
        expect(result.current.collectionIdToDelete).toBeNull();
    });

    it('routes to detail page on open collection', () => {
        vi.mocked(useQuestionBankCollectionsQuery).mockReturnValue({
            data: {
                items: [],
                totalPages: 1,
                total: 0,
            },
            isLoading: false,
        } as any);

        const { result } = renderHook(() => useCollectionManagement());

        act(() => {
            result.current.handleOpenCollection('collection-123');
        });

        expect(mockPush).toHaveBeenCalledWith('/question/bank/collections/collection-123');
    });
});
