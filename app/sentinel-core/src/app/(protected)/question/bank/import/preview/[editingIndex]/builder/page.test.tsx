// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const updateQuestionMock = vi.fn();
const transformMock = vi.fn();
const EditQuestionViewMock = vi.fn(
    (props: {
        editingIndex: number;
        editingQuestion: {
            type: string;
            passageContent: string | null;
            passageType: string | null;
        };
        onBack: () => void;
        onUpdate: (id: string, updates: Record<string, unknown>) => void;
    }) => (
        <div
            data-testid="edit-question-view"
            data-index={props.editingIndex}
            data-type={props.editingQuestion.type}
            data-passage-content={props.editingQuestion.passageContent ?? ''}
            data-passage-type={props.editingQuestion.passageType ?? ''}
        >
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
}));

vi.mock(
    '@/app/(protected)/question/bank/_components/dialogs/import-modal/_hooks/use-ai-import-store',
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

vi.mock('@/app/(protected)/question/bank/import/preview/_hooks/use-preview-manager/_utils', () => ({
    transformAiQuestionToExamQuestion: (...args: unknown[]) => {
        transformMock(...args);

        return {
            id: 'question-1',
            type: 'ESSAY',
            sourceOrigin: 'AI_PDF',
            sourceFileName: 'source.pdf',
            sourcePageNumber: 3,
            sourceEvidence: 'evidence',
            passageContent: '<p>Imported passage</p>',
            passageType: 'html',
        };
    },
}));

vi.mock(
    '@/app/(protected)/question/bank/import/preview/_components/views/edit-question-view',
    () => ({
        EditQuestionView: (props: unknown) =>
            EditQuestionViewMock(
                props as {
                    editingIndex: number;
                    editingQuestion: { type: string };
                    onBack: () => void;
                    onUpdate: (id: string, updates: Record<string, unknown>) => void;
                },
            ),
    }),
);

vi.mock(
    '@/app/(protected)/question/bank/import/preview/_components/layout/preview-loading-state',
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
        EditQuestionViewMock.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    afterAll(() => {
        EditQuestionViewMock.mockReset();
    });

    it('loads the selected preview question and supports back/save flow', () => {
        render(<Page />);

        expect(transformMock).toHaveBeenCalledWith(1, expect.any(Object));
        expect(screen.getByTestId('edit-question-view').getAttribute('data-type')).toBe('ESSAY');
        expect(screen.getByTestId('edit-question-view').getAttribute('data-passage-content')).toBe(
            '<p>Imported passage</p>',
        );
        expect(screen.getByTestId('edit-question-view').getAttribute('data-passage-type')).toBe(
            'html',
        );

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
