import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ExamsNav } from './exams-nav';

const mockPathname = vi.hoisted(() => vi.fn());
const mockSearchParams = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname(),
    useSearchParams: () => mockSearchParams(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ExamsNav', () => {
    it.each([
        ['/exams', undefined, 'Dashboard'],
        ['/exams', 'assign', 'Assignments'],
        ['/exams/assign', undefined, 'Assignments'],
        ['/exams', 'grade', 'Grading'],
        ['/exams/grading', undefined, 'Grading'],
        ['/exams/logs', undefined, 'Incident Logs'],
    ])('highlights %s as %s', (pathname, view, expectedLabel) => {
        mockPathname.mockReturnValue(pathname);
        mockSearchParams.mockReturnValue(new URLSearchParams(view ? { view } : {}));

        render(<ExamsNav />);

        const activeLink = screen.getByRole('link', { name: expectedLabel });
        expect(activeLink.className).toContain('bg-accent/50');
        expect(activeLink.className).toContain('border-r-2');
    });

    it('renders the expected exam links', () => {
        mockPathname.mockReturnValue('/exams');
        mockSearchParams.mockReturnValue(new URLSearchParams());

        render(<ExamsNav />);

        expect(screen.getByRole('link', { name: 'Dashboard' }).getAttribute('href')).toBe('/exams');
        expect(screen.getByRole('link', { name: 'Assignments' }).getAttribute('href')).toBe(
            '/exams?view=assign',
        );
        expect(screen.getByRole('link', { name: 'Grading' }).getAttribute('href')).toBe(
            '/exams?view=grade',
        );
        expect(screen.getByRole('link', { name: 'Incident Logs' }).getAttribute('href')).toBe(
            '/exams/logs',
        );
    });
});
