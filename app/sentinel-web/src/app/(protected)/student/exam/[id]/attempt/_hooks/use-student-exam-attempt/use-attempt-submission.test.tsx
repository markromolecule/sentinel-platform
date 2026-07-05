import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAttemptSubmission } from './use-attempt-submission';

const {
    mockRouterReplace,
    mockWriteStoredExamTurnInPreview,
    mockScoreExamAttempt,
    mockExitFullscreen,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockWriteStoredExamTurnInPreview: vi.fn(),
    mockScoreExamAttempt: vi.fn(() => ({
        score: 1,
        totalScore: 1,
        percentage: 100,
        correctCount: 1,
        incorrectCount: 0,
        unansweredCount: 0,
        requiresManualReview: false,
        manualReviewQuestionCount: 0,
    })),
    mockExitFullscreen: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('@sentinel/shared', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/shared')>('@sentinel/shared');

    return {
        ...actual,
        scoreExamAttempt: (...args: Parameters<typeof mockScoreExamAttempt>) =>
            mockScoreExamAttempt(...args),
    };
});

vi.mock('@/app/(protected)/student/exam/[id]/_lib/exam-turn-in-storage', () => ({
    writeStoredExamTurnInPreview: (...args: Parameters<typeof mockWriteStoredExamTurnInPreview>) =>
        mockWriteStoredExamTurnInPreview(...args),
}));

describe('useAttemptSubmission', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        Object.defineProperty(document, 'fullscreenElement', {
            value: { nodeName: 'HTML' },
            configurable: true,
        });
        Object.defineProperty(document, 'exitFullscreen', {
            value: mockExitFullscreen,
            configurable: true,
        });
    });

    it('suspends monitoring before navigation and fullscreen teardown during turn-in', async () => {
        const suspendSecurityMonitoring = vi.fn();

        const { result } = renderHook(() =>
            useAttemptSubmission({
                examId: '11111111-1111-1111-1111-111111111111',
                sessionId: '22222222-2222-2222-2222-222222222222',
                releaseScoreMode: 'AUTO_RELEASE',
                questions: [
                    {
                        id: 'question-1',
                        questionId: 'question-1',
                        orderIndex: 0,
                        points: 1,
                        type: 'MULTIPLE_CHOICE',
                        content: {
                            prompt: 'Question 1',
                            options: ['A', 'B', 'C', 'D'],
                        },
                    },
                ] as any,
                selectedAnswers: {
                    'question-1': 'A',
                },
                elapsedSeconds: 120,
                unansweredCount: 0,
                isRedirectingToTurnIn: false,
                setIsRedirectingToTurnIn: vi.fn(),
                setIsSubmitDialogOpen: vi.fn(),
                suspendSecurityMonitoring,
                isBlocked: false,
            }),
        );

        act(() => {
            result.current.handleSubmit();
        });

        expect(suspendSecurityMonitoring).toHaveBeenCalledTimes(1);
        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/11111111-1111-1111-1111-111111111111/result',
        );
        expect(suspendSecurityMonitoring.mock.invocationCallOrder[0]).toBeLessThan(
            mockRouterReplace.mock.invocationCallOrder[0],
        );

        await act(async () => {
            vi.runAllTimers();
            await Promise.resolve();
        });

        expect(mockExitFullscreen).toHaveBeenCalledTimes(1);
        expect(suspendSecurityMonitoring.mock.invocationCallOrder[0]).toBeLessThan(
            mockExitFullscreen.mock.invocationCallOrder[0],
        );
    });
});
