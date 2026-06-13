import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useGradingAttempt } from './index';
import { getGradingAttemptDetail, updateGradingAttempt } from '@sentinel/services';

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
}));

vi.mock('@sentinel/services', () => ({
    getGradingAttemptDetail: vi.fn(),
    updateGradingAttempt: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
}

describe('useGradingAttempt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes grading states and calculates scores correctly', async () => {
        const attemptDetail = {
            attempt: {
                id: 'attempt-id',
                examId: 'exam-id',
                studentName: 'Alice Student',
                studentNumber: '2026-0001',
                examTitle: 'Final Exam',
                subjectTitle: 'Computer Science',
                totalScore: 100,
                status: 'SUBMITTED',
                completedAt: '2026-06-13T00:00:00Z',
                answers: {
                    'q-1': 'essay answer text',
                },
                evaluations: {},
            },
            questions: [
                {
                    id: 'q-1',
                    examId: 'exam-id',
                    type: 'ESSAY',
                    points: 20,
                    orderIndex: 0,
                    content: {
                        prompt: 'Explain polymorphism.',
                    },
                },
            ],
        };

        vi.mocked(getGradingAttemptDetail).mockResolvedValue(attemptDetail);

        const { result } = renderHook(
            () => useGradingAttempt({ examId: 'exam-id', attemptId: 'attempt-id' }),
            {
                wrapper: createWrapper(),
            },
        );

        // Wait for query to resolve and hook state to initialize
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
            expect(result.current.attemptDetail).toEqual(attemptDetail);
        });

        // Verify initial evaluations setup (default score of 4 for each criteria)
        expect(result.current.evaluations['q-1']).toEqual({
            scores: {
                contentSubstance: 4,
                structureOrganization: 4,
                argumentationSupport: 4,
                styleTone: 4,
                grammarConventions: 4,
            },
            feedback: '',
        });

        expect(result.current.scoreSummary.essayScore).toBe(20); // 4/4 is 100% of 20 points
        expect(result.current.activeQuestionId).toBe('q-1');
    });

    it('updates scores and feedback states via handler functions', async () => {
        const attemptDetail = {
            attempt: {
                id: 'attempt-id',
                examId: 'exam-id',
                studentName: 'Alice Student',
                studentNumber: '2026-0001',
                examTitle: 'Final Exam',
                subjectTitle: 'Computer Science',
                totalScore: 100,
                status: 'SUBMITTED',
                completedAt: '2026-06-13T00:00:00Z',
                answers: {
                    'q-1': 'essay answer text',
                },
                evaluations: {},
            },
            questions: [
                {
                    id: 'q-1',
                    examId: 'exam-id',
                    type: 'ESSAY',
                    points: 20,
                    orderIndex: 0,
                    content: {
                        prompt: 'Explain polymorphism.',
                    },
                },
            ],
        };

        vi.mocked(getGradingAttemptDetail).mockResolvedValue(attemptDetail);

        const { result } = renderHook(
            () => useGradingAttempt({ examId: 'exam-id', attemptId: 'attempt-id' }),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Modify a rubric score
        act(() => {
            result.current.handleScoreChange('q-1', 'contentSubstance', 2);
        });

        // contentSubstance score drops to 2 from 4.
        // Weighted calculation:
        // contentSubstance has a weight of 0.30 in ESSAY_RUBRIC_CRITERIA.
        // Let's verify that the essay score updates correctly.
        expect(result.current.evaluations['q-1'].scores.contentSubstance).toBe(2);

        // Update feedback
        act(() => {
            result.current.handleFeedbackChange('q-1', 'Needs improvement');
            result.current.setOverallFeedback('Decent attempt overall');
        });

        expect(result.current.evaluations['q-1'].feedback).toBe('Needs improvement');
        expect(result.current.overallFeedback).toBe('Decent attempt overall');
    });

    it('calls update mutation when handleSubmit is called', async () => {
        const attemptDetail = {
            attempt: {
                id: 'attempt-id',
                examId: 'exam-id',
                studentName: 'Alice Student',
                studentNumber: '2026-0001',
                examTitle: 'Final Exam',
                subjectTitle: 'Computer Science',
                totalScore: 100,
                status: 'SUBMITTED',
                completedAt: '2026-06-13T00:00:00Z',
                answers: {
                    'q-1': 'essay answer text',
                },
                evaluations: {},
            },
            questions: [
                {
                    id: 'q-1',
                    examId: 'exam-id',
                    type: 'ESSAY',
                    points: 20,
                    orderIndex: 0,
                    content: {
                        prompt: 'Explain polymorphism.',
                    },
                },
            ],
        };

        vi.mocked(getGradingAttemptDetail).mockResolvedValue(attemptDetail);
        vi.mocked(updateGradingAttempt).mockResolvedValue({
            attemptId: 'attempt-id',
            score: 18,
            totalScore: 20,
        });

        const { result } = renderHook(
            () => useGradingAttempt({ examId: 'exam-id', attemptId: 'attempt-id' }),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.handleSubmit();
        });

        await waitFor(() => {
            expect(updateGradingAttempt).toHaveBeenCalledWith(mockApiClient, 'attempt-id', {
                evaluations: {
                    'q-1': {
                        scores: {
                            contentSubstance: 4,
                            structureOrganization: 4,
                            argumentationSupport: 4,
                            styleTone: 4,
                            grammarConventions: 4,
                        },
                        feedback: null,
                    },
                },
                feedback: null,
            });
        });
    });
});
