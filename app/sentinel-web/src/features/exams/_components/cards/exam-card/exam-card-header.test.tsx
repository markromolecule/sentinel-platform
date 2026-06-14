import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExamCardHeader } from './exam-card-header';
import type { ExamCardProps } from '@sentinel/shared/types';

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

function buildExam(overrides: Partial<ExamCardProps['exam']> = {}): ExamCardProps['exam'] {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        description: 'An exam for testing the visibility badge.',
        duration: 60,
        passingScore: 75,
        status: 'draft',
        createdAt: '2026-06-14T07:00:00.000Z',
        updatedAt: '2026-06-14T07:30:00.000Z',
        ...overrides,
    } as ExamCardProps['exam'];
}

describe('ExamCardHeader', () => {
    it('shows the public badge when the exam is public', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: true })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        expect(screen.getByText('Public')).toBeTruthy();
    });

    it('shows the private badge when the exam is not public', () => {
        render(
            <ExamCardHeader
                exam={buildExam({ isPublic: false })}
                statusClass="border-amber-200 bg-amber-50 text-amber-700"
                onDeleteClick={vi.fn()}
                onEditClick={vi.fn()}
            />,
        );

        expect(screen.getByText('Private')).toBeTruthy();
    });
});
