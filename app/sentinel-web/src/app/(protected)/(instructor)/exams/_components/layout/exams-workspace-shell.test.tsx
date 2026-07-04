import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamsWorkspaceShell } from './exams-workspace-shell';

let mockPathname = '/exams';

vi.mock('next/navigation', () => ({
    usePathname: () => mockPathname,
}));

vi.mock('./exams-nav', () => ({
    ExamsNav: () => <div data-testid="exams-nav" />,
}));

describe('ExamsWorkspaceShell', () => {
    afterEach(() => {
        mockPathname = '/exams';
        cleanup();
    });

    it('renders the Exams heading without an icon next to it', () => {
        render(
            <ExamsWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamsWorkspaceShell>,
        );

        const heading = screen.getByRole('heading', { name: 'Exams' });

        expect(heading).toBeTruthy();
        expect(heading.parentElement?.querySelector('svg')).toBeNull();
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });

    it('does not render the Exams sidebar layout for nested report paths', () => {
        mockPathname = '/exams/reports/exam-123/attempt-456';

        render(
            <ExamsWorkspaceShell>
                <div data-testid="shell-child">Content</div>
            </ExamsWorkspaceShell>,
        );

        const heading = screen.queryByRole('heading', { name: 'Exams' });
        expect(heading).toBeNull();
        expect(screen.getByTestId('shell-child')).toBeTruthy();
    });
});
