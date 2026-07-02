import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
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
    afterEach(() => {
        cleanup();
    });

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

    it('renders turned_in state correctly', () => {
        render(
            <ExamCard exam={{ ...defaultExam, status: 'turned_in', attemptId: 'attempt-id' }} />,
        );
        const badge = screen.getByText('turned in');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-green-500');

        const button = screen.getByRole('button', { name: /review flow/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(false);

        const link = button.closest('a');
        expect(link).toBeTruthy();
        expect(link?.getAttribute('href')).toBe('/student/history/attempts/attempt-id');
    });

    it('falls back to the canonical exam history route when a completed exam has no attempt id', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'completed' }} />);

        const button = screen.getByRole('button', { name: /review flow/i }) as HTMLButtonElement;
        const link = button.closest('a');

        expect(link).toBeTruthy();
        expect(link?.getAttribute('href')).toBe('/student/history/exams/test-id');
    });

    it('renders past_due state correctly', () => {
        render(<ExamCard exam={{ ...defaultExam, status: 'past_due' }} />);
        const badge = screen.getByText('past due');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-muted');

        const button = screen.getByRole('button', { name: /past due/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(true);
    });

    it('renders scheduled state correctly', () => {
        render(
            <ExamCard
                exam={{ ...defaultExam, status: 'scheduled' } as StudentExamCardProps['exam']}
            />,
        );
        const badge = screen.getByText('scheduled');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-amber-500');

        const button = screen.getByRole('button', { name: /upcoming/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(true);
    });

    it('renders archived state correctly', () => {
        render(
            <ExamCard
                exam={{ ...defaultExam, status: 'archived' } as StudentExamCardProps['exam']}
            />,
        );
        const badge = screen.getByText('archived');
        expect(badge).toBeTruthy();
        expect(badge.className).toContain('bg-muted');

        const button = screen.getByRole('button', { name: /archived/i }) as HTMLButtonElement;
        expect(button).toBeTruthy();
        expect(button.disabled).toBe(true);
    });
});
