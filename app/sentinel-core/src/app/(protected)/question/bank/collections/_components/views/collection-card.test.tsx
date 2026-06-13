import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { CollectionCard } from './collection-card';
import { Collection } from '../../_types';

const mockCollection: Collection = {
    id: 'test-id',
    name: 'Test Collection',
    description: 'Test Description',
    lastUpdated: '2 hours ago',
    questionCount: 5,
    isPublic: true,
    author: 'John Doe',
};

afterEach(() => {
    cleanup();
});

describe('CollectionCard', () => {
    it('renders author when provided', () => {
        render(<CollectionCard collection={mockCollection} />);
        expect(screen.getByText('By John Doe')).toBeTruthy();
    });

    it('does not render author when null or undefined', () => {
        const collectionWithoutAuthor = {
            ...mockCollection,
            author: null,
        };
        render(<CollectionCard collection={collectionWithoutAuthor} />);
        expect(screen.queryByText(/By /)).toBeNull();
    });
});
