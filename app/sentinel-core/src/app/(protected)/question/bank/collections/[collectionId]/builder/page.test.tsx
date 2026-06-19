// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const QuestionBuilderFormMock = vi.fn((props: { type: string; onBack: () => void }) => (
    <div data-testid="question-builder-form" data-type={props.type}>
        <button type="button" onClick={props.onBack}>
            Cancel
        </button>
    </div>
));

vi.mock('next/navigation', () => ({
    useParams: () => ({ collectionId: 'collection-1' }),
    useRouter: () => ({ push: pushMock }),
    useSearchParams: () => ({ get: () => 'question-1' }),
}));

vi.mock('@sentinel/hooks', () => ({
    useAddQuestionBankCollectionQuestionsMutation: () => ({ mutateAsync: vi.fn() }),
    useCreateQuestionMutation: () => ({ mutateAsync: vi.fn() }),
    useQuestionBankCollectionQuery: () => ({
        data: {
            id: 'collection-1',
            name: 'Collection Name',
            description: 'A collection.',
            questions: [],
        },
        isLoading: false,
    }),
    useQuestionQuery: () => ({
        data: {
            id: 'question-1',
            subjectId: null,
            institutionId: null,
            sourceOrigin: 'MANUAL',
            sourceFileName: null,
            sourcePageNumber: null,
            sourceEvidence: null,
            passageContent: null,
            passageType: null,
            type: 'ESSAY',
            difficulty: 'MODERATE',
            points: 1,
            tags: [],
            content: { prompt: 'Essay prompt' },
            prompt: 'Essay prompt',
            createdAt: null,
            updatedAt: null,
            createdBy: null,
            updatedBy: null,
            status: 'ACTIVE',
        },
        isLoading: false,
    }),
    useQuestionTypesQuery: () => ({
        data: [{ value: 'ESSAY', label: 'Essay' }],
        isLoading: false,
    }),
    useStableValue: (factory: () => unknown) => factory(),
    useUpdateQuestionMutation: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/features/exams', () => ({
    QuestionBuilderForm: (props: unknown) => QuestionBuilderFormMock(props as { type: string }),
}));

describe('Collection builder route', () => {
    let Page: typeof import('./page').default;

    beforeAll(async () => {
        Page = (await import('./page')).default;
    }, 30000);

    beforeEach(() => {
        pushMock.mockReset();
        QuestionBuilderFormMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    afterAll(() => {
        QuestionBuilderFormMock.mockReset();
    });

    it('renders the selected collection question and supports back navigation', () => {
        render(<Page />);

        expect(screen.getByTestId('question-builder-form').getAttribute('data-type')).toBe('ESSAY');
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(pushMock).toHaveBeenCalledWith('/question/bank/collections/collection-1');
    });
});
