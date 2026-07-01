'use client';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamResultPage from './page';

const {
    mockApiClient,
    mockRouterReplace,
    mockToastSuccess,
    mockToastError,
    mockCompleteExamSession,
    mockReadStoredExamTurnInPreview,
    mockClearStoredExamTurnInPreview,
    mockClearStoredExamSession,
    mockQueryClient,
} = vi.hoisted(() => ({
    mockApiClient: vi.fn(),
    mockRouterReplace: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockCompleteExamSession: vi.fn(),
    mockReadStoredExamTurnInPreview: vi.fn(),
    mockClearStoredExamTurnInPreview: vi.fn(),
    mockClearStoredExamSession: vi.fn(),
    mockQueryClient: {
        setQueriesData: vi.fn(),
        invalidateQueries: vi.fn().mockResolvedValue(undefined),
    },
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useApi: () => mockApiClient,
}));

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => mockQueryClient,
}));

vi.mock('@sentinel/services', () => ({
    completeExamSession: mockCompleteExamSession,
}));

vi.mock('@sentinel/ui', () => ({
    Button: ({
        children,
        onClick,
        disabled,
        asChild,
        variant,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        asChild?: boolean;
        variant?: string;
    }) => {
        if (asChild) {
            return <>{children}</>;
        }

        return (
            <button type="button" onClick={onClick} disabled={disabled} data-variant={variant}>
                {children}
            </button>
        );
    },
}));

vi.mock('sonner', () => ({
    toast: {
        success: mockToastSuccess,
        error: mockToastError,
    },
}));

vi.mock('../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => ({
        examId: '11111111-1111-1111-1111-111111111111',
        exam: {
            title: 'Midterm Exam',
            status: 'published',
            attemptId: null,
        },
    }),
}));

vi.mock('../_lib/exam-turn-in-storage', () => ({
    readStoredExamTurnInPreview: mockReadStoredExamTurnInPreview,
    clearStoredExamTurnInPreview: mockClearStoredExamTurnInPreview,
}));

vi.mock('../_lib/exam-session-storage', () => ({
    clearStoredExamSession: mockClearStoredExamSession,
}));

vi.mock('../_lib/student-exam-session-feedback', () => ({
    resolveStudentExamSessionError: () => 'Unable to turn in exam.',
}));

describe('StudentExamResultPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryClient.invalidateQueries.mockResolvedValue(undefined);
    });

    it('shows a fallback state when no turn-in preview is stored', async () => {
        mockReadStoredExamTurnInPreview.mockReturnValue(null);

        render(<StudentExamResultPage />);

        expect(await screen.findByText('Result Preview Missing')).toBeTruthy();
        expect(screen.getByText('Back to Attempt')).toBeTruthy();
    });

    it('submits the stored preview and redirects to the feedback page', async () => {
        mockReadStoredExamTurnInPreview.mockReturnValue({
            examId: '11111111-1111-1111-1111-111111111111',
            sessionId: '22222222-2222-2222-2222-222222222222',
            answers: {
                'question-1': 'A',
            },
            elapsedSeconds: 120,
            summary: {
                score: 18,
                totalScore: 20,
                percentage: 90,
                answeredCount: 10,
                autoGradableQuestionCount: 10,
                manualReviewQuestionCount: 0,
                requiresManualReview: false,
            },
            storedAt: '2026-04-18T10:00:00.000Z',
        });
        mockCompleteExamSession.mockResolvedValue({
            attemptId: '33333333-3333-3333-3333-333333333333',
            score: 18,
            totalScore: 20,
            percentage: 90,
            answeredCount: 10,
            autoGradableQuestionCount: 10,
            manualReviewQuestionCount: 0,
            requiresManualReview: false,
            completedAt: '2026-04-18T10:05:00.000Z',
        });

        render(<StudentExamResultPage />);

        fireEvent.click(await screen.findByRole('button', { name: 'Turn In' }));

        await waitFor(() => {
            expect(mockCompleteExamSession).toHaveBeenCalledWith(mockApiClient, {
                sessionId: '22222222-2222-2222-2222-222222222222',
                answers: {
                    'question-1': 'A',
                },
                elapsedSeconds: 120,
            });
        });

        expect(mockClearStoredExamTurnInPreview).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
        );
        expect(mockClearStoredExamSession).toHaveBeenCalledWith(
            '11111111-1111-1111-1111-111111111111',
        );
        expect(mockQueryClient.setQueriesData).toHaveBeenCalled();
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams'],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
            queryKey: ['exams', 'history'],
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('Exam turned in successfully.');
        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/11111111-1111-1111-1111-111111111111/feedback?attemptId=33333333-3333-3333-3333-333333333333',
        );
    });
});
