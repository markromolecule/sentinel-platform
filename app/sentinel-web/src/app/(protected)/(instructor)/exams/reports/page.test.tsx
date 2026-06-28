'use client';

import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExamReportsIndexPage from './page';

afterEach(() => {
    cleanup();
});

vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

vi.mock('@sentinel/hooks', () => ({
    useExamReportsListQuery: ({ page = 1, limit = 6, search }: any = {}) => {
        const allData = Array.from({ length: 10 }, (_, index) => ({
            id: `exam-${index + 1}`,
            title: `Exam ${index + 1}`,
            subject: 'Algorithms',
            scheduledDate: '2026-06-26T09:00:00.000Z',
            studentsCount: 12,
            questionCount: 20,
            publishedAt: '2026-06-25T09:00:00.000Z',
        }));

        const filtered = search
            ? allData.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
            : allData;

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const sliced = filtered.slice(startIndex, startIndex + limit);

        return {
            data: {
                data: sliced,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                },
            },
            isLoading: false,
        };
    },
}));

describe('ExamReportsIndexPage', () => {
    it('renders report summary links for exams', () => {
        render(<ExamReportsIndexPage />);

        expect(screen.getByText('Exam 1')).toBeTruthy();
        expect(screen.queryByText('Exam 10')).toBeNull();
        expect(screen.getAllByRole('link', { name: 'Report Summary' })[0]?.getAttribute('href')).toBe(
            '/exams/reports/exam-1',
        );
    });

    it('paginates the report cards', async () => {
        render(<ExamReportsIndexPage />);

        fireEvent.click(screen.getAllByRole('button', { name: /next/i })[0]!);

        expect(await screen.findByText('Exam 10')).toBeTruthy();
        expect(screen.queryByText('Exam 6')).toBeNull();
    });
});
