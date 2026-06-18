// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const updateQuestionMock = vi.fn();
const createQuestionMock = vi.fn();
const QuestionBuilderFormMock = vi.fn((props: {
    type: string;
    onBack: () => void;
    onUpdate: (id: string, updates: Record<string, unknown>) => void;
}) => (
    <div data-testid="question-builder-form" data-type={props.type}>
        <button type="button" onClick={props.onBack}>
            Cancel
        </button>
        <button
            type="button"
            onClick={() =>
                props.onUpdate('question-1', {
                    type: 'MULTIPLE_CHOICE',
                    content: { prompt: 'Updated prompt' },
                    difficulty: 'EASY',
                    points: 3,
                    tags: [],
                    passageContent: null,
                    passageType: 'plain',
                })
            }
        >
            Save
        </button>
    </div>
));

vi.mock('next/navigation', () => ({
    useParams: () => ({ questionId: 'question-1' }),
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('@sentinel/hooks', () => ({
    useCreateQuestionMutation: () => ({ mutateAsync: createQuestionMock }),
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
            type: 'MULTIPLE_CHOICE',
            difficulty: 'MODERATE',
            points: 1,
            tags: [],
            content: { prompt: 'What is the answer?' },
            prompt: 'What is the answer?',
            createdAt: null,
            updatedAt: null,
            createdBy: null,
            updatedBy: null,
            status: 'ACTIVE',
        },
        isLoading: false,
    }),
    useQuestionTypesQuery: () => ({
        data: [{ value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' }],
        isLoading: false,
    }),
    useStableValue: (factory: () => unknown) => factory(),
    useUpdateQuestionMutation: () => ({ mutateAsync: updateQuestionMock }),
}));

vi.mock('@/features/exams', () => ({
    QuestionBuilderForm: (props: unknown) => QuestionBuilderFormMock(props as { type: string }),
}));

describe('Question bank builder route', () => {
    let Page: typeof import('./page').default;

    beforeAll(async () => {
        Page = (await import('./page')).default;
    }, 30000);

    beforeEach(() => {
        pushMock.mockReset();
        updateQuestionMock.mockReset();
        createQuestionMock.mockReset();
        QuestionBuilderFormMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    afterAll(() => {
        QuestionBuilderFormMock.mockReset();
    });

    it('renders the loaded question and supports back navigation', () => {
        render(<Page />);

        expect(screen.getByTestId('question-builder-form').getAttribute('data-type')).toBe(
            'MULTIPLE_CHOICE',
        );
        expect(QuestionBuilderFormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                builderMode: true,
                initialData: expect.objectContaining({ id: 'question-1' }),
            }),
        );

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(pushMock).toHaveBeenCalledWith('/question/bank');
    });

    it('saves the edited question back to the question bank', async () => {
        render(<Page />);

        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(updateQuestionMock).toHaveBeenCalledWith({
            id: 'question-1',
            payload: {
                type: 'MULTIPLE_CHOICE',
                difficulty: 'EASY',
                points: 3,
                tags: [],
                content: { prompt: 'Updated prompt' },
                passageContent: null,
                passageType: 'plain',
            },
        });
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/question/bank');
        });
    });
});
