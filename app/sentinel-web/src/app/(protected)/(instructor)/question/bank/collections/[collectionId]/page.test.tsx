// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const QuestionsTableMock = vi.fn((props: { onEdit: (question: { id: string }) => void }) => (
    <button type="button" onClick={() => props.onEdit({ id: 'question-1' })}>
        Edit Question
    </button>
));

vi.mock('next/navigation', () => ({
    useParams: () => ({ collectionId: 'collection-1' }),
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('@sentinel/hooks', () => ({
    useQuestionBankCollectionQuery: () => ({
        data: {
            id: 'collection-1',
            name: 'Collection Name',
            description: 'A collection.',
            questions: [{ id: 'question-1' }],
        },
        isLoading: false,
    }),
    useRemoveQuestionBankCollectionQuestionsMutation: () => ({
        mutateAsync: vi.fn(),
        isPending: false,
    }),
    useStableValue: (factory: () => unknown) => factory(),
}));

vi.mock('@/app/(protected)/(instructor)/question/bank/_components/tables/questions-table', () => ({
    QuestionsTable: (props: unknown) =>
        QuestionsTableMock(props as { onEdit: (question: { id: string }) => void }),
}));

vi.mock('@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal', () => ({
    ImportModal: () => null,
}));

vi.mock('../_components/dialogs/delete-collection-dialog', () => ({
    DeleteCollectionDialog: () => null,
}));

vi.mock('../_components/dialogs/edit-collection-dialog', () => ({
    EditCollectionDialog: () => null,
}));

vi.mock('@/app/(protected)/(instructor)/question/bank/_components/views/questions-empty-state', () => ({
    QuestionsEmptyState: () => null,
}));

describe('Collection questions page', () => {
    let Page: typeof import('./page').default;

    beforeAll(async () => {
        Page = (await import('./page')).default;
    }, 30000);

    beforeEach(() => {
        pushMock.mockReset();
        QuestionsTableMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('routes collection edits into the builder page', () => {
        render(<Page />);

        fireEvent.click(screen.getByRole('button', { name: /edit question/i }));
        expect(pushMock).toHaveBeenCalledWith(
            '/question/bank/collections/collection-1/builder?questionId=question-1',
        );
    });
});
