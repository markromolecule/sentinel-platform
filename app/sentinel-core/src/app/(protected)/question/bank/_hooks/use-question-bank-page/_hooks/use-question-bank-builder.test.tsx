import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
const createQuestionMock = vi.fn();
const updateQuestionMock = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('@sentinel/hooks', () => ({
    useCreateQuestionMutation: () => ({ mutateAsync: createQuestionMock }),
    useQuestionTypesQuery: () => ({
        data: [
            {
                value: 'MULTIPLE_CHOICE',
                label: 'Multiple Choice',
                description: 'Select one correct option among choices.',
            },
        ],
        isLoading: false,
    }),
    useStableValue: (factory: () => unknown) => factory(),
    useUpdateQuestionMutation: () => ({ mutateAsync: updateQuestionMock }),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
    },
}));

import { useQuestionBankBuilder } from './use-question-bank-builder';

describe('useQuestionBankBuilder', () => {
    beforeEach(() => {
        pushMock.mockReset();
        createQuestionMock.mockReset();
        updateQuestionMock.mockReset();
    });

    it('opens the type selector, routes edits, and normalizes payloads', async () => {
        const { result } = renderHook(() => useQuestionBankBuilder());

        act(() => {
            result.current.handleOpenCreateQuestion();
        });

        expect(result.current.isTypeSelectorOpen).toBe(true);
        expect(result.current.activeQuestionType).toBeNull();

        act(() => {
            result.current.handleSelectQuestionType('MULTIPLE_CHOICE');
        });

        expect(result.current.isTypeSelectorOpen).toBe(false);
        expect(result.current.isQuestionBuilderOpen).toBe(true);
        expect(result.current.activeQuestionType).toBe('MULTIPLE_CHOICE');

        await act(async () => {
            await result.current.handleCreateQuestion({
                type: 'MULTIPLE_CHOICE',
                content: {
                    prompt: 'What is 2 + 2?',
                    options: ['3', '4'],
                    correctAnswer: '4',
                },
                difficulty: 'EASY',
                points: 1,
                tags: ['algebra'],
                passageContent: 'Passage text',
                passageType: 'plain',
            });
        });

        expect(createQuestionMock).toHaveBeenCalledWith({
            type: 'MULTIPLE_CHOICE',
            difficulty: 'EASY',
            points: 1,
            tags: ['algebra'],
            content: {
                prompt: 'What is 2 + 2?',
                options: ['3', '4'],
                correctAnswer: '4',
            },
            passageContent: 'Passage text',
            passageType: 'plain',
        });
        expect(result.current.isQuestionBuilderOpen).toBe(false);
        expect(result.current.activeQuestionType).toBeNull();

        await act(async () => {
            await result.current.handleUpdateQuestion('question-1', {
                type: 'MULTIPLE_CHOICE',
                content: {
                    prompt: 'Updated prompt',
                    options: ['A', 'B'],
                    correctAnswer: 'B',
                },
                difficulty: 'MODERATE',
                points: 2,
                tags: [],
                passageContent: null,
                passageType: null,
            });
        });

        expect(updateQuestionMock).toHaveBeenCalledWith({
            id: 'question-1',
            payload: {
                type: 'MULTIPLE_CHOICE',
                difficulty: 'MODERATE',
                points: 2,
                tags: [],
                content: {
                    prompt: 'Updated prompt',
                    options: ['A', 'B'],
                    correctAnswer: 'B',
                },
                passageContent: null,
                passageType: 'plain',
            },
        });

        await act(async () => {
            await result.current.handleDuplicateQuestion({
                id: 'question-2',
                subjectId: null,
                institutionId: null,
                sourceOrigin: 'MANUAL',
                sourceFileName: null,
                sourcePageNumber: null,
                sourceEvidence: null,
                passageContent: 'Duplicate passage',
                passageType: 'html',
                type: 'MULTIPLE_CHOICE',
                difficulty: 'HARD',
                points: 3,
                tags: ['review'],
                content: {
                    prompt: 'Duplicate me',
                    options: ['Yes', 'No'],
                    correctAnswer: 'Yes',
                },
                prompt: 'Duplicate me',
                createdAt: null,
                updatedAt: null,
                createdBy: null,
                updatedBy: null,
                status: 'ACTIVE',
            } as never);
        });

        expect(createQuestionMock).toHaveBeenLastCalledWith({
            type: 'MULTIPLE_CHOICE',
            difficulty: 'HARD',
            points: 3,
            tags: ['review'],
            content: {
                prompt: 'Duplicate me',
                options: ['Yes', 'No'],
                correctAnswer: 'Yes',
            },
            passageContent: 'Duplicate passage',
            passageType: 'html',
            subjectId: undefined,
            institutionId: undefined,
        });
        expect(pushMock).toHaveBeenCalledTimes(0);
    });

    it('routes existing question edits into the builder page', () => {
        const { result } = renderHook(() => useQuestionBankBuilder());

        act(() => {
            result.current.handleEditQuestion({
                id: 'question-1',
            } as never);
        });

        expect(pushMock).toHaveBeenCalledWith('/question/bank/question-1/builder');
    });
});
