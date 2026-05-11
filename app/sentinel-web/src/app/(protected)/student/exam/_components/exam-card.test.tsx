import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExamCard } from './exam-card';
import type { StudentExamCardProps } from '@sentinel/shared/types';

const defaultExam: StudentExamCardProps['exam'] = {
    id: 'test-id',
    title: 'Test Exam',
    subject: 'Subject',
    duration: 60,
    status: 'upcoming',
};

describe('ExamCard', () => {
    it('renders upcoming state correctly', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'upcoming' }} />);
        const badge = screen.getByText('upcoming');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-amber-500');

        const button = screen.getByRole('button', { name: /upcoming/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(true);
    });

    it('renders available state correctly', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'available' }} />);
        const badge = screen.getByText('available');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-primary');

        const button = screen.getByRole('button', { name: /open exam/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(false);
    });

    it('renders in-progress state correctly', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'in-progress' }} />);
        const badge = screen.getByText('in-progress');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-secondary');

        const button = screen.getByRole('button', { name: /resume exam/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(false);
    });

    it('renders completed state correctly', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'completed' }} />);
        const badge = screen.getByText('completed');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-muted');

        const button = screen.getByRole('button', { name: /review flow/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(false);
    });
});
