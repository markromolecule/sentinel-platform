import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExamsWorkspaceShell } from './exams-workspace-shell';

vi.mock('next/navigation', () => ({
    usePathname: () => '/exams',
}));

vi.mock('./exams-nav', () => ({
    ExamsNav: () => <div data-testid="exams-nav" />,
}));

describe('ExamsWorkspaceShell', () => {
    afterEach(() => {
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
});
