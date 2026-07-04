// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

const pageState = {
    questions: [] as Array<{ id: string }>,
    isQuestionsLoading: false,
    searchQuery: '',
    totalQuestions: 0,
    pageCount: 0,
    pageIndex: 0,
    pageSize: 10,
    columnFilters: [],
    questionTypes: [{ value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' }],
    activeQuestionType: null as string | null,
    activeQuestionTypeDefinition: undefined as
        { value: string; label: string; description?: string } | undefined,
    isQuestionBuilderOpen: false,
    isTypeSelectorOpen: false,
    isQuestionTypesLoading: false,
    isDeletingQuestions: false,
    isImportModalOpen: false,
    isDeleteQuestionsDialogOpen: false,
    questionsPendingDeletion: [] as Array<{ prompt?: string; content?: { prompt?: string } }>,
};

const handleEditQuestionMock = vi.fn();
const QuestionsTableMock = vi.fn((props: { onEdit: (question: { id: string }) => void }) => (
    <button type="button" onClick={() => props.onEdit({ id: 'question-1' })}>
        Edit Question
    </button>
));

vi.mock('@/app/(protected)/question/bank/_hooks/use-question-bank-page', () => ({
    useQuestionBankPage: () => {
        const [, setVersion] = useState(0);
        const forceRender = () => setVersion((current) => current + 1);

        return {
            ...pageState,
            handleOpenCreateQuestion: () => {
                pageState.isTypeSelectorOpen = true;
                forceRender();
            },
            handleSelectQuestionType: (type: string) => {
                pageState.activeQuestionType = type;
                pageState.isTypeSelectorOpen = false;
                pageState.isQuestionBuilderOpen = true;
                forceRender();
            },
            handleCloseQuestionBuilder: () => {
                pageState.isQuestionBuilderOpen = false;
                pageState.activeQuestionType = null;
                forceRender();
            },
            handleCreateQuestion: vi.fn(),
            handleUpdateQuestion: vi.fn(),
            handleDuplicateQuestionPayload: vi.fn(),
            handleEditQuestion: handleEditQuestionMock,
            handleDuplicateQuestion: vi.fn(),
            setIsTypeSelectorOpen: (open: boolean) => {
                pageState.isTypeSelectorOpen = open;
                forceRender();
            },
            setIsImportModalOpen: (open: boolean) => {
                pageState.isImportModalOpen = open;
                forceRender();
            },
            setIsDeleteQuestionsDialogOpen: (open: boolean) => {
                pageState.isDeleteQuestionsDialogOpen = open;
                forceRender();
            },
            setSearchQuery: vi.fn(),
            setPagination: vi.fn(),
            setColumnFilters: vi.fn(),
            handleDeleteQuestion: vi.fn(),
            handleDeleteSelectedQuestions: vi.fn(),
            handleConfirmDeleteQuestions: vi.fn(),
        };
    },
}));

vi.mock('@sentinel/ui', () => ({
    Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
        open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-content">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    PageHeader: ({ title, description }: { title: string; description: string }) => (
        <header>
            <h1>{title}</h1>
            <p>{description}</p>
        </header>
    ),
    Separator: () => <hr />,
    VisuallyHidden: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/exams', () => ({
    QuestionBuilderForm: ({ type }: { type: string }) => (
        <div data-testid="question-builder-form" data-type={type} />
    ),
    QuestionTypeSelectorDialog: ({
        open,
        onSelect,
    }: {
        open: boolean;
        onSelect: (type: string) => void;
    }) =>
        open ? (
            <button type="button" onClick={() => onSelect('MULTIPLE_CHOICE')}>
                Select Multiple Choice
            </button>
        ) : null,
}));

vi.mock('../dialogs/import-modal', () => ({
    ImportModal: () => null,
}));

vi.mock('../dialogs/delete-questions-dialog', () => ({
    DeleteQuestionsDialog: () => null,
}));

vi.mock('../tables/questions-table', () => ({
    QuestionsTable: (props: unknown) =>
        QuestionsTableMock(props as { onEdit: (question: { id: string }) => void }),
}));

vi.mock('./questions-empty-state', () => ({
    QuestionsEmptyState: ({ onCreate }: { onCreate: () => void }) => (
        <button type="button" onClick={onCreate}>
            Create Question
        </button>
    ),
}));

vi.mock('../../../_components/layout', () => ({
    QuestionBankPageShell: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="question-bank-shell">{children}</div>
    ),
}));

import { QuestionBankPageContent } from './question-bank-page-content';

describe('QuestionBankPageContent', () => {
    afterEach(() => {
        cleanup();
        QuestionsTableMock.mockClear();
        handleEditQuestionMock.mockClear();
        pageState.questions = [];
        pageState.isTypeSelectorOpen = false;
        pageState.activeQuestionType = null;
        pageState.isQuestionBuilderOpen = false;
    });

    it('opens the create flow through the type selector and builder', () => {
        render(<QuestionBankPageContent />);

        fireEvent.click(screen.getByRole('button', { name: /create question/i }));
        expect(screen.getByRole('button', { name: /select multiple choice/i })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /select multiple choice/i }));
        expect(screen.getByTestId('question-builder-form').getAttribute('data-type')).toBe(
            'MULTIPLE_CHOICE',
        );
    });

    it('routes edit actions from the table into the builder page', () => {
        pageState.questions = [{ id: 'question-1' }];

        render(<QuestionBankPageContent />);

        fireEvent.click(screen.getByRole('button', { name: /edit question/i }));
        expect(handleEditQuestionMock).toHaveBeenCalledWith({ id: 'question-1' });
    });
});
