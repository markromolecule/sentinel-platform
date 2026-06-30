'use client';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudentExamFeedbackThankYouPage from './page';

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: () => '22222222-2222-2222-2222-222222222222',
    }),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('../../_hooks/use-student-exam-data', () => ({
    useStudentExamData: () => ({
        examId: '11111111-1111-1111-1111-111111111111',
    }),
}));

describe('StudentExamFeedbackThankYouPage', () => {
    it('renders the thank-you page with result and exam links', () => {
        render(<StudentExamFeedbackThankYouPage />);

        expect(screen.getByText('Thank you for the feedback')).toBeTruthy();
        expect(screen.getByRole('link', { name: /view exam result/i }).getAttribute('href')).toBe(
            '/student/history/details?attemptId=22222222-2222-2222-2222-222222222222',
        );
        expect(screen.getByRole('link', { name: /back to exam/i }).getAttribute('href')).toBe(
            '/student/exam/11111111-1111-1111-1111-111111111111',
        );
    });
});
