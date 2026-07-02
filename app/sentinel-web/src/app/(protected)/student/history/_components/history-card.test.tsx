import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HistoryCardProps } from '@sentinel/shared/types';
import { HistoryCard } from './history-card';

vi.mock('next/link', () => ({
    default: ({
        children,
        href,
        className,
    }: {
        children: ReactNode;
        href: string;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

const baseItem: HistoryCardProps['item'] = {
    examId: 'exam-123',
    examTitle: 'Operating Systems Finals',
    status: 'turned_in',
    score: 12,
    timeSpent: 45,
    cheated: false,
    availableAt: '2026-07-01T10:00:00.000Z',
    dueAt: '2026-07-01T12:00:00.000Z',
    completedAt: '2026-07-01T11:30:00.000Z',
};

describe('HistoryCard', () => {
    afterEach(() => {
        cleanup();
    });

    it('links completed items with an attempt id to the canonical attempt history route', () => {
        render(
            <HistoryCard
                item={{
                    ...baseItem,
                    attemptId: 'attempt-456',
                }}
            />,
        );

        expect(screen.getByRole('link').getAttribute('href')).toBe(
            '/student/history/attempts/attempt-456',
        );
    });

    it('links completed items without an attempt id to the canonical exam history route', () => {
        render(
            <HistoryCard
                item={{
                    ...baseItem,
                    attemptId: null,
                }}
            />,
        );

        expect(screen.getByRole('link').getAttribute('href')).toBe(
            '/student/history/exams/exam-123',
        );
    });
});
