// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const updateQuestionMock = vi.fn();
const transformMock = vi.fn();
const QuestionBuilderFormMock = vi.fn(
    (props: {
        type: string;
        initialData: { type: string };
        onBack: () => void;
        onUpdate: (id: string, updates: Record<string, unknown>) => void;
    }) => (
        <div data-testid="question-builder-form" data-type={props.type}>
            <button type="button" onClick={props.onBack}>
                Back
            </button>
            <button
                type="button"
                onClick={() =>
                    props.onUpdate('question-1', {
                        content: { prompt: 'Updated prompt' },
                        difficulty: 'EASY',
                        points: 3,
                    })
                }
            >
                Save
            </button>
        </div>
    ),
);

vi.mock('next/navigation', () => ({
    useParams: () => ({ editingIndex: '1' }),
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@sentinel/hooks', () => ({
    useStableValue: (factory: () => unknown) => factory(),
    useQuestionTypesQuery: () => ({
        data: [{ value: 'ESSAY', label: 'Essay' }],
        isLoading: false,
    }),
}));

vi.mock(
    '@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store',
    () => ({
        useAiImportStore: () => ({
            previewData: {
                questions: [{ id: 'question-1' }, { id: 'question-2' }],
            },
            isGenerating: false,
            hasHydrated: true,
            updateQuestion: updateQuestionMock,
        }),
    }),
);

vi.mock(
    '@/app/(protected)/(instructor)/question/bank/import/preview/_hooks/use-preview-manager/_utils',
    () => ({
        transformAiQuestionToExamQuestion: (...args: unknown[]) => {
            transformMock(...args);

            return {
                id: 'question-1',
                type: 'ESSAY',
                sourceOrigin: 'AI_PDF',
                sourceFileName: 'source.pdf',
                sourcePageNumber: 3,
                sourceEvidence: 'evidence',
                passageContent: null,
                passageType: null,
            };
        },
    }),
);

vi.mock('@/features/exams', () => ({
    QuestionBuilderForm: (props: unknown) =>
        QuestionBuilderFormMock(
            props as {
                type: string;
                initialData: { type: string };
                onBack: () => void;
                onUpdate: (id: string, updates: Record<string, unknown>) => void;
            },
        ),
}));

vi.mock(
    '@/app/(protected)/(instructor)/question/bank/import/preview/_components/layout/preview-loading-state',
    () => ({
        PreviewLoadingState: () => <div data-testid="preview-loading-state" />,
    }),
);

describe('Import preview builder route', () => {
    let Page: typeof import('./page').default;

    beforeAll(async () => {
        Page = (await import('./page')).default;
    }, 30000);

    beforeEach(() => {
        pushMock.mockReset();
        updateQuestionMock.mockReset();
        transformMock.mockClear();
        QuestionBuilderFormMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    afterAll(() => {
        QuestionBuilderFormMock.mockReset();
    });

    it('loads the selected preview question and supports back/save flow', () => {
        render(<Page />);

        expect(transformMock).toHaveBeenCalledWith(1, expect.any(Object));
        expect(screen.getByTestId('question-builder-form').getAttribute('data-type')).toBe('ESSAY');

        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(updateQuestionMock).toHaveBeenCalledWith(1, {
            content: { prompt: 'Updated prompt' },
            difficulty: 'EASY',
            points: 3,
        });
        expect(pushMock).toHaveBeenCalledWith('/question/bank/import/preview');
    });

    it('returns to the preview list when backing out', () => {
        render(<Page />);

        fireEvent.click(screen.getByRole('button', { name: /back/i }));
        expect(pushMock).toHaveBeenCalledWith('/question/bank/import/preview');
    });
});
