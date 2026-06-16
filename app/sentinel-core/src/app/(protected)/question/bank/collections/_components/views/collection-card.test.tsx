import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CollectionCard } from './collection-card';
import { useQuestionBankCollectionSharesQuery } from '@sentinel/hooks';
import { Collection } from '../../_types';

vi.mock('@sentinel/hooks', () => ({
    useQuestionBankCollectionSharesQuery: vi.fn(),
}));

const mockCollection: Collection = {
    id: 'test-id',
    name: 'Test Collection',
    description: 'Test Description',
    lastUpdated: '2 hours ago',
    questionCount: 5,
    isPublic: true,
    author: 'John Doe',
    createdById: 'creator-1',
    updatedById: 'creator-1',
};

afterEach(() => {
    cleanup();
});

describe('CollectionCard', () => {
    it('renders author when provided', () => {
        vi.mocked(useQuestionBankCollectionSharesQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as never);

        render(<CollectionCard collection={mockCollection} currentUserId="creator-1" />);
        expect(screen.getByText('By John Doe')).toBeTruthy();
    });

    it('does not render author when null or undefined', () => {
        vi.mocked(useQuestionBankCollectionSharesQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as never);

        const collectionWithoutAuthor = {
            ...mockCollection,
            author: null,
        };
        render(<CollectionCard collection={collectionWithoutAuthor} currentUserId="creator-1" />);
        expect(screen.queryByText(/By /)).toBeNull();
    });
});
