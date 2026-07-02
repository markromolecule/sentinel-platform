import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamSessionNav } from './exam-session-nav';

const mockPathname = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExamSessionNav', () => {
    it('renders Lobby and Monitoring links for the current exam', () => {
        mockPathname.mockReturnValue('/exams/exam-1/lobby');

        render(<ExamSessionNav examId="exam-1" />);

        expect(screen.getByRole('link', { name: 'Lobby' }).getAttribute('href')).toBe(
            '/exams/exam-1/lobby',
        );
        expect(screen.getByRole('link', { name: 'Monitoring' }).getAttribute('href')).toBe(
            '/exams/exam-1/monitoring',
        );
    });

    it('marks Lobby active for lobby routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/lobby');

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Lobby' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('marks Monitoring active for nested monitoring student routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/monitoring/student-1');

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Monitoring' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });
});
