import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamSessionNav } from './exam-session-nav';

const mockPathname = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => ({
    get: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname(),
    useSearchParams: () => mockSearchParams,
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExamSessionNav', () => {
    it('renders all runtime access links for the current exam', () => {
        mockPathname.mockReturnValue('/exams/exam-1/lobby');
        mockSearchParams.get.mockReturnValue(null);

        render(<ExamSessionNav examId="exam-1" />);

        expect(screen.getByRole('link', { name: 'Lobby' }).getAttribute('href')).toBe(
            '/exams/exam-1/lobby',
        );
        expect(screen.getByRole('link', { name: 'Monitoring' }).getAttribute('href')).toBe(
            '/exams/exam-1/monitoring',
        );
        expect(screen.getByRole('link', { name: 'Attempt Summary' }).getAttribute('href')).toBe(
            '/exams/exam-1/report',
        );
        expect(screen.getByRole('link', { name: 'Action Queue' }).getAttribute('href')).toBe(
            '/exams/exam-1/report?section=queue',
        );
        expect(screen.getByRole('link', { name: 'Incident Logs' }).getAttribute('href')).toBe(
            '/exams/exam-1/logs',
        );
    });

    it('marks Lobby active for lobby routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/lobby');
        mockSearchParams.get.mockReturnValue(null);

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Lobby' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('marks Monitoring active for nested monitoring student routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/monitoring/student-1');
        mockSearchParams.get.mockReturnValue(null);

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Monitoring' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('marks Attempt Summary active for report routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/report');
        mockSearchParams.get.mockImplementation((key: string) =>
            key === 'section' ? null : null,
        );

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Attempt Summary' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('marks Action Queue active for queued report routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/report');
        mockSearchParams.get.mockImplementation((key: string) =>
            key === 'section' ? 'queue' : null,
        );

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Action Queue' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('marks Incident Logs active for logs routes', () => {
        mockPathname.mockReturnValue('/exams/exam-1/logs');
        mockSearchParams.get.mockReturnValue(null);

        render(<ExamSessionNav examId="exam-1" />);

        const activeLink = screen.getByRole('link', { name: 'Incident Logs' });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });
});
