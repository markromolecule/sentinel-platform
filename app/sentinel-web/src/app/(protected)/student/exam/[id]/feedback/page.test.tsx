'use client';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamFeedbackPage from './page';

const {
    mockRouterReplace,
    mockMutate,
    mockToastSuccess,
    mockToastError,
    mockSearchParamsGet,
} = vi.hoisted(() => ({
    mockRouterReplace: vi.fn(),
    mockMutate: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
    mockSearchParamsGet: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: mockRouterReplace,
    }),
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useCreateFeedbackMutation: (args?: { onSuccess?: () => void; onError?: (error: Error) => void }) => ({
        mutate: (payload: unknown) => {
            mockMutate(payload);
            args?.onSuccess?.();
        },
        isPending: false,
    }),
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
        },
    }),
}));

describe('StudentExamFeedbackPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('shows the current exam title in the feedback header', () => {
        mockSearchParamsGet.mockReturnValue('22222222-2222-2222-2222-222222222222');

        render(<StudentExamFeedbackPage />);

        expect(screen.getByText('Midterm Exam')).toBeTruthy();
        expect(screen.getByText('Exam Feedback')).toBeTruthy();
    });

    it('requires a rating before submission', async () => {
        mockSearchParamsGet.mockReturnValue('22222222-2222-2222-2222-222222222222');

        render(<StudentExamFeedbackPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

        expect(
            await screen.findByText('Please select a rating before submitting your feedback.'),
        ).toBeTruthy();
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it('submits feedback and redirects to the thank-you page', async () => {
        mockSearchParamsGet.mockReturnValue('22222222-2222-2222-2222-222222222222');

        render(<StudentExamFeedbackPage />);

        fireEvent.click(screen.getByText('Excellent'));
        fireEvent.change(screen.getByLabelText(/experience details/i), {
            target: { value: 'Everything felt smooth.' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                attemptId: '22222222-2222-2222-2222-222222222222',
                rating: 5,
                experience: 'Everything felt smooth.',
            });
        });

        expect(mockToastSuccess).toHaveBeenCalledWith('Thanks for sharing your feedback.');
        expect(mockRouterReplace).toHaveBeenCalledWith(
            '/student/exam/11111111-1111-1111-1111-111111111111/feedback/thank-you?attemptId=22222222-2222-2222-2222-222222222222',
        );
    });

    it('shows a validation error when attempt information is missing', async () => {
        mockSearchParamsGet.mockReturnValue(null);

        render(<StudentExamFeedbackPage />);

        fireEvent.click(screen.getByText('Excellent'));
        fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

        expect(
            await screen.findByText('Attempt information is missing. Return to your exam history.'),
        ).toBeTruthy();
        expect(mockMutate).not.toHaveBeenCalled();
    });
});
