'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentExamFeedbackThankYouPage from './page';

const { mockSearchParamsGet } = vi.hoisted(() => ({
    mockSearchParamsGet: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: mockSearchParamsGet,
    }),
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

describe('StudentExamFeedbackThankYouPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();
        mockSearchParamsGet.mockReturnValue('22222222-2222-2222-2222-222222222222');
    });

    it('renders the simplified thank-you page with the result link', () => {
        render(<StudentExamFeedbackThankYouPage />);

        expect(screen.getByText('Thank you for the feedback')).toBeTruthy();
        expect(screen.getByRole('link', { name: /view exam result/i }).getAttribute('href')).toBe(
            '/student/history/attempts/22222222-2222-2222-2222-222222222222',
        );
    });

    it('falls back to student history when attempt id is missing', () => {
        mockSearchParamsGet.mockReturnValue(null);

        render(<StudentExamFeedbackThankYouPage />);

        expect(screen.getByRole('link', { name: /view exam result/i }).getAttribute('href')).toBe(
            '/student/history',
        );
    });
});
