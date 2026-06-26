'use client';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExamReportsIndexPage from './page';

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useExamsQuery: () => ({
        data: Array.from({ length: 10 }, (_, index) => ({
            id: `exam-${index + 1}`,
            title: `Exam ${index + 1}`,
            subject: 'Algorithms',
            scheduledDate: '2026-06-26T09:00:00.000Z',
            studentsCount: 12,
            questionCount: 20,
            publishedAt: '2026-06-25T09:00:00.000Z',
        })),
        isLoading: false,
    }),
}));

describe('ExamReportsIndexPage', () => {
    it('renders report summary links for exams', () => {
        render(<ExamReportsIndexPage />);

        expect(screen.getByText('Exam 1')).toBeTruthy();
        expect(screen.queryByText('Exam 10')).toBeNull();
        expect(screen.getAllByRole('link', { name: 'Open Report Summary' })[0]?.getAttribute('href')).toBe(
            '/exams/exam-1/report',
        );
    });

    it('paginates the report cards', () => {
        render(<ExamReportsIndexPage />);

        fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]!);

        expect(screen.getByText('Exam 10')).toBeTruthy();
        expect(screen.queryByText('Exam 9')).toBeNull();
    });
});
