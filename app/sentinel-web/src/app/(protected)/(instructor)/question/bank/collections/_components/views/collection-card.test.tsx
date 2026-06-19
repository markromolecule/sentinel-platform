import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { CollectionCard } from './collection-card';
import { useQuestionBankCollectionSharesQuery } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useQuestionBankCollectionSharesQuery: vi.fn(),
}));

vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');

    return {
        ...actual,
        DropdownMenu: ({ children }: { children: unknown }) => <div>{children}</div>,
        DropdownMenuTrigger: ({ children }: { children: unknown }) => <div>{children}</div>,
        DropdownMenuContent: ({ children }: { children: unknown }) => <div>{children}</div>,
        DropdownMenuItem: ({ children }: { children: unknown }) => <div>{children}</div>,
    };
});

afterEach(() => {
    cleanup();
});

const baseCollection = {
    id: 'collection-1',
    name: 'Biology Set',
    description: 'A sample collection',
    lastUpdated: '2 days ago',
    questionCount: 12,
    isPublic: false,
    createdById: 'creator-1',
    updatedById: 'creator-1',
};

describe('CollectionCard permissions', () => {
    it('hides creator-only actions for a non-creator who is not shared', async () => {
        vi.mocked(useQuestionBankCollectionSharesQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);

        render(<CollectionCard collection={baseCollection} currentUserId="viewer-1" />);

        expect(screen.queryByText('Share Collection')).toBeNull();
        expect(screen.queryByText('Delete Collection')).toBeNull();
        expect(screen.queryByText('Edit Collection')).toBeNull();
    });

    it('allows a shared user to edit but not share or delete', async () => {
        vi.mocked(useQuestionBankCollectionSharesQuery).mockReturnValue({
            data: [
                {
                    userId: 'viewer-1',
                    firstName: 'Viewer',
                    lastName: 'User',
                    email: 'viewer@example.com',
                },
            ],
            isLoading: false,
        } as any);

        render(<CollectionCard collection={baseCollection} currentUserId="viewer-1" />);

        expect(screen.getByText('Edit Collection')).toBeTruthy();
        expect(screen.queryByText('Share Collection')).toBeNull();
        expect(screen.queryByText('Delete Collection')).toBeNull();
    });

    it('shows share and delete actions for the creator', async () => {
        vi.mocked(useQuestionBankCollectionSharesQuery).mockReturnValue({
            data: [],
            isLoading: false,
        } as any);

        render(<CollectionCard collection={baseCollection} currentUserId="creator-1" />);

        expect(screen.getByText('Share Collection')).toBeTruthy();
        expect(screen.getByText('Delete Collection')).toBeTruthy();
    });
});
